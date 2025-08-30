// app/lib/env.ts
export const config = {
  // Using the provided Turso database
  database: {
    url: process.env.DATABASE_URL || "libsql://tar-tarfw.aws-ap-south-1.turso.io",
    authToken: process.env.DATABASE_AUTH_TOKEN || "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTY1NzgyNTAsImlkIjoiZjU3ZDFkZDEtN2JhNC00YzA3LWFkZmQtYzdlOTgwZmVkN2YxIiwicmlkIjoiOTQ1NDkzZjctODU1Yy00Mjc5LWFmMjItOGE3ZDVlZjdkM2Y0In0.OdU-c9jq9mi5MzcjCPIIONMICJWN2EueJj_kUeyMKi94CWyCevj4a0edYOy3evpy7dLlfa_pw7yfO8j2-KrDAw",
  },
  
  app: {
    environment: process.env.NODE_ENV || "development",
  },
};