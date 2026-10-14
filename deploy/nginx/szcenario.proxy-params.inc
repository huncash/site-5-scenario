## include — csak szcenario.hu. Site-1..4 / 3000-3003 tilos.
proxy_http_version 1.1;
proxy_set_header Host              $host;
proxy_set_header X-Real-IP         $remote_addr;
proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-Host  $host;
proxy_set_header Upgrade           $http_upgrade;
proxy_set_header Connection        "upgrade";
proxy_cache_bypass $http_upgrade;
proxy_connect_timeout 5s;
proxy_read_timeout 60s;
