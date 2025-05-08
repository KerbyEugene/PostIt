using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PostHubServer.Models;
using PostHubServer.Models.DTOs;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;

namespace PostHubServer.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        readonly UserManager<User> _userManager;

        public UsersController(UserManager<User> userManager)
        {
            _userManager = userManager;
        }

        [HttpPost]
        public async Task<ActionResult> Register(RegisterDTO register)
        {
            if (register.Password != register.PasswordConfirm)
            {
                return StatusCode(StatusCodes.Status400BadRequest,
                    new { Message = "Les deux mots de passe spécifiés sont différents." });
            }
            User user = new User()
            {
                UserName = register.Username,
                Email = register.Email
            };
            IdentityResult identityResult = await _userManager.CreateAsync(user, register.Password);
            if (!identityResult.Succeeded)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { Message = "La création de l'utilisateur a échoué." });
            }
            return Ok(new { Message = "Inscription réussie ! 🥳" });
        }

        [HttpPost]
        public async Task<ActionResult> Login(LoginDTO login)
        {
            User? user = await _userManager.FindByNameAsync(login.Username);
            if (user != null && await _userManager.CheckPasswordAsync(user, login.Password))
            {
                IList<string> roles = await _userManager.GetRolesAsync(user);
                List<Claim> authClaims = new List<Claim>();
                foreach (string role in roles)
                {
                    authClaims.Add(new Claim(ClaimTypes.Role, role));
                }
                authClaims.Add(new Claim(ClaimTypes.NameIdentifier, user.Id));
                SymmetricSecurityKey key = new SymmetricSecurityKey(Encoding.UTF8
                    .GetBytes("LooOOongue Phrase SiNoN Ça ne Marchera PaAaAAAaAas !"));
                JwtSecurityToken token = new JwtSecurityToken(
                    issuer: "https://localhost:7216",
                    audience: "http://localhost:4200",
                    claims: authClaims,
                    expires: DateTime.Now.AddMinutes(300),
                    signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature)
                    );
                return Ok(new
                {
                    token = new JwtSecurityTokenHandler().WriteToken(token),
                    validTo = token.ValidTo,
                    username = user.UserName // Ceci sert déjà à afficher / cacher certains boutons côté Angular
                });
            }
            else
            {
                return StatusCode(StatusCodes.Status400BadRequest,
                    new { Message = "Le nom d'utilisateur ou le mot de passe est invalide." });
            }
        }

        [HttpPut]
        public async Task<ActionResult<Picture>> ChangeAvatar()
        {

            var user = await _userManager.GetUserAsync(User);

            IFormCollection formCollection = await Request.ReadFormAsync();
            IFormFile? file = formCollection.Files.GetFile("monImage"); // ⛔ Même clé que dans le FormData 😠

            if (file == null) return BadRequest(new { Message = "Fournis une image, niochon" });

            Image image = Image.Load(file.OpenReadStream());


            user.FileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            user.MimeType = file.ContentType;
               


            // ⛔ Ce dossier (projet/images/big) DOIT déjà exister 📂 !! Créez-le d'abord !
            image.Save(Directory.GetCurrentDirectory() + "/images/avatar/" + user.FileName);

           
               
            await _userManager.UpdateAsync(user);
                 

            // La seule chose dont le client pourrait avoir besoin, c'est l'id de l'image.
            // On aurait pu ne rien retourner aussi, selon les besoins du client Angular.
            return Ok();
     
        }
        [HttpGet("{size}/{username}")]
        public async Task<ActionResult<Picture>> GetAvatar(string size, string username)
        {
            var user = await _userManager.FindByNameAsync(username);
            if (user == null) return NotFound();

            // Si la size fournit ne correspond pas à "big" OU "smol", erreur.
            if (!Regex.Match(size, "Avatar|thumbnail").Success) return BadRequest(new { Message = "La taille demandée n'existe pas." });

            // Récupération du fichier sur le disque
            byte[] bytes = System.IO.File.ReadAllBytes(Directory.GetCurrentDirectory() + "/images/" + size + "/" + user.FileName);
            return File(bytes, user.MimeType);
        }
    }
}
