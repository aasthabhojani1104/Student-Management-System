using System.Text;
using FluentValidation;
using FluentValidation.AspNetCore;
using JWTDemo.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Scalar.AspNetCore;
using Student_Management_System.Data;
using Student_Management_System.Mapping;
using Student_Management_System.Services.Implementation;
using Student_Management_System.Services.Interface;
using Student_Management_System.Validators;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    WebRootPath = "wwwroot"
});


// =====================================================
// Controllers + FluentValidation
// =====================================================

builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        // Return a consistent 400 JSON response when FluentValidation fails
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState
                .Where(e => e.Value?.Errors.Count > 0)
                .SelectMany(e => e.Value!.Errors.Select(err => new
                {
                    field   = e.Key,
                    message = err.ErrorMessage
                }))
                .ToList();

            return new Microsoft.AspNetCore.Mvc.BadRequestObjectResult(new
            {
                message = "Validation failed.",
                errors
            });
        };
    });

// Register all validators from the Validators assembly
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<LoginValidator>();


// =====================================================
// JWT Authentication
// =====================================================

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme =
        JwtBearerDefaults.AuthenticationScheme;

    options.DefaultChallengeScheme =
        JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],

        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(
                builder.Configuration["Jwt:Key"]!
            )
        )
    };
});


// =====================================================
// Authorization
// =====================================================

builder.Services.AddAuthorization();


// =====================================================
// OpenAPI / Scalar
// =====================================================

builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, context, cancellationToken) =>
    {
        document.Components ??= new();

        document.Components.SecuritySchemes ??=
            new Dictionary<string, IOpenApiSecurityScheme>();

        document.Components.SecuritySchemes.Add(
            "Bearer",
            new OpenApiSecurityScheme
            {
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description =
                    "Enter your JWT token here (no need to type 'Bearer' prefix)"
            });

        return Task.CompletedTask;
    });
});


// =====================================================
// CORS - Angular
// =====================================================

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:4200",
                "https://localhost:4200"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});


// =====================================================
// Database
// =====================================================

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("Default")
    ));


// =====================================================
// AutoMapper
// =====================================================

builder.Services.AddAutoMapper(typeof(MappingProfile));


// =====================================================
// Services
// =====================================================

builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IUserService, UserServices>();
builder.Services.AddScoped<IUserRoleService, UserRoleService>();
builder.Services.AddScoped<IStatusService, StatusService>();
builder.Services.AddScoped<IPriorityService, PriorityService>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<IProjectAllocationService, ProjectAllocationService>();
builder.Services.AddScoped<ITaskService, TaskService>();


// JWT Token Service
builder.Services.AddScoped<TokenService>();


var app = builder.Build();


// =====================================================
// Development Tools
// =====================================================

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}


// =====================================================
// Middleware
// =====================================================

app.UseCors("AllowAngular");

app.UseHttpsRedirection();

app.UseStaticFiles();


// IMPORTANT:
// Authentication must come BEFORE Authorization
app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();


// =====================================================
// Warm up DB connection pool AND EF query plans
// =====================================================

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider
        .GetRequiredService<AppDbContext>();

    await db.Roles
        .AsNoTracking()
        .AnyAsync();

    await db.Users
        .AsNoTracking()
        .AnyAsync();

    await db.Statuses
        .AsNoTracking()
        .AnyAsync();
}


app.Run();