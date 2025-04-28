namespace PostHubServer.Models
{
    public class Picture
    {
        public int Id { get; set; }
        public string FileName { get; set; } = null!;
        public string MimeType { get; set; } = null!;

        public int PostId { get; set; }
        public virtual Post Post { get; set; } = null!;
    }
}
