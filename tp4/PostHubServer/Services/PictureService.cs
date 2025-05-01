using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using PostHubServer.Data;
using PostHubServer.Models;
using System.Text.RegularExpressions;

namespace PostHubServer.Services
{
    public class PictureService
    {
        private readonly PostHubContext _context;

        public PictureService(PostHubContext context)
        {
            _context = context;

        }

        public async Task<Picture?> GetPicture(int id)
        {
            return await _context.Pictures.FindAsync(id);
        }


        private bool IsContextNull() => _context == null || _context.Pictures == null;
    }
}
