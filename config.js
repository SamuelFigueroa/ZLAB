const { NODE_ENV, PORT, HOST, MONGO_URI, SECRET_OR_KEY, UPLOAD_DIR } = process.env;

export const
  nodeEnv=NODE_ENV,
  port=PORT,
  host=HOST,
  mongoURI=MONGO_URI,
  secretOrKey=SECRET_OR_KEY,
  uploadDir=UPLOAD_DIR;
