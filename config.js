const { NODE_ENV, PORT, HOST, MONGO_URI, SECRET_OR_KEY, STORAGE_DIR, CACHE_DIR } = process.env;

export const
  nodeEnv=NODE_ENV,
  port=PORT,
  host=HOST,
  mongoURI=MONGO_URI,
  secretOrKey=SECRET_OR_KEY,
  storageDir=STORAGE_DIR,
  cacheDir=CACHE_DIR;
