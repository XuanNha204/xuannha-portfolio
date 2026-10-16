using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using XuanNha.Dev.Constants;
using XuanNha.Dev.Data;
using XuanNha.Dev.Entities.Profile;
using XuanNha.Dev.ViewModels.Admin;

namespace XuanNha.Dev.Areas.Admin.Controllers;

[Area("Admin")]
[Authorize(Roles = AppRoles.Admin)]
public sealed class CertificatesController : Controller
{
    private readonly ApplicationDbContext _dbContext;

    public CertificatesController(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IActionResult> Index(CancellationToken cancellationToken)
    {
        var certificates = await _dbContext.Certificates
            .AsNoTracking()
            .OrderByDescending(certificate => certificate.IssuedAt)
            .ToListAsync(cancellationToken);

        return View(certificates);
    }

    public IActionResult Create()
    {
        return View(new CertificateFormViewModel());
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(CertificateFormViewModel model, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return View(model);
        }

        _dbContext.Certificates.Add(new Certificate
        {
            Name = model.Name.Trim(),
            Issuer = model.Issuer?.Trim() ?? string.Empty,
            IssuedAt = model.IssuedAt,
            CredentialUrl = string.IsNullOrWhiteSpace(model.CredentialUrl) ? null : model.CredentialUrl.Trim()
        });
        await _dbContext.SaveChangesAsync(cancellationToken);
        TempData["AdminSuccess"] = "Certificate created.";

        return RedirectToAction(nameof(Index));
    }

    public async Task<IActionResult> Edit(Guid id, CancellationToken cancellationToken)
    {
        var certificate = await _dbContext.Certificates
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (certificate is null)
        {
            return NotFound();
        }

        return View(new CertificateFormViewModel
        {
            Id = certificate.Id,
            Name = certificate.Name,
            Issuer = certificate.Issuer,
            IssuedAt = certificate.IssuedAt,
            CredentialUrl = certificate.CredentialUrl
        });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(Guid id, CertificateFormViewModel model, CancellationToken cancellationToken)
    {
        if (id != model.Id)
        {
            return BadRequest();
        }

        if (!ModelState.IsValid)
        {
            return View(model);
        }

        var certificate = await _dbContext.Certificates.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (certificate is null)
        {
            return NotFound();
        }

        certificate.Name = model.Name.Trim();
        certificate.Issuer = model.Issuer?.Trim() ?? string.Empty;
        certificate.IssuedAt = model.IssuedAt;
        certificate.CredentialUrl = string.IsNullOrWhiteSpace(model.CredentialUrl) ? null : model.CredentialUrl.Trim();

        await _dbContext.SaveChangesAsync(cancellationToken);
        TempData["AdminSuccess"] = "Certificate updated.";

        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var certificate = await _dbContext.Certificates.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (certificate is null)
        {
            return NotFound();
        }

        _dbContext.Certificates.Remove(certificate);
        await _dbContext.SaveChangesAsync(cancellationToken);
        TempData["AdminSuccess"] = "Certificate deleted.";

        return RedirectToAction(nameof(Index));
    }
}
