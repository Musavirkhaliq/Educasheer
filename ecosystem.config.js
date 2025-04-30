module.exports = {
  apps: [
    {
      name: "educasheer-backend",
      script: "./backend/server.js",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 5000,
        MONGO_URL: "mongodb://localhost:27017",
        DB_NAME: "educasheer",
        CORS_ORIGIN: "https://learn.sukoonsphere.org",
        ACCESS_TOKEN_SECRET: "your-access-token-secret",
        REFRESH_TOKEN_SECRET: "your-refresh-token-secret",
        ACCESS_TOKEN_EXPIRES_IN: "1d",
        REFRESH_TOKEN_EXPIRES_IN: "10d",
        CLOUDINARY_CLOUD_NAME: "SukoonSphere",
        CLOUDINARY_API_KEY: "886621559396257",
        CLOUDINARY_API_SERCRET: "neo6vM5-zlvKwTZy7vWdGYhRfdU",
        YOUTUBE_API_KEY: "AIzaSyCVTgtSlfY8E6Es2m8z79VBl1NfamIJ_ZQ"
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
        MONGO_URL: "mongodb://localhost:27017",
        DB_NAME: "educasheer",
        CORS_ORIGIN: "https://learn.sukoonsphere.org",
        ACCESS_TOKEN_SECRET: "your-access-token-secret",
        REFRESH_TOKEN_SECRET: "your-refresh-token-secret",
        ACCESS_TOKEN_EXPIRES_IN: "1d",
        REFRESH_TOKEN_EXPIRES_IN: "10d",
        CLOUDINARY_CLOUD_NAME: "SukoonSphere",
        CLOUDINARY_API_KEY: "886621559396257",
        CLOUDINARY_API_SERCRET: "neo6vM5-zlvKwTZy7vWdGYhRfdU",
        YOUTUBE_API_KEY: "AIzaSyCVTgtSlfY8E6Es2m8z79VBl1NfamIJ_ZQ"
      }
    }
  ]
};
