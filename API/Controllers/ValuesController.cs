using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ValuesController : ControllerBase
    {
        private readonly DataContext _dbContext;

        public ValuesController(DataContext dbContext)
        {
            _dbContext = dbContext;
        }

        // GET: /api/values
        public async Task<ActionResult<IEnumerable<Value>>> GetValues()
        {
            var values = await _dbContext.Values.ToListAsync();
            
            return Ok(values);
        }

        // GET: /api/values/1
        [Route("{id}")]
        public async Task<ActionResult<Value>> GetValues(int id)
        {
            var value = await _dbContext.Values.SingleOrDefaultAsync(v => v.Id == id);

            if (value == null)
                return NotFound();

            return Ok(value);
        }
    }
}