using System.ComponentModel.DataAnnotations;

namespace PostHubServer.Models.DTOs
{
    public class ChangePasswordDTO
    {
        [Required]
        public string OldPassword { get; set; } = null!;
        [Required]
        public string NewPassword { get; set; } = null!;
    }
}
