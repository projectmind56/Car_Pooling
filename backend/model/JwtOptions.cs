﻿namespace backend.Models
{
    public class JwtOptions
    {
        public string Issuer { get; set; } = "";
        public string Audience {get; set;} = "";
        public string Key {get; set;} = "";
        public int ExpirationMinutes {get; set;} = 60;
    }
}