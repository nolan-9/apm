import "dotenv/config";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "./src/services/s3.js";

async function probarS3() {
  try {
    const comando = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: "productos/prueba-finazon.txt",
      Body: "Prueba de conexion entre FINazon y Amazon S3",
      ContentType: "text/plain",
    });

    await s3.send(comando);

    console.log("Conexion con Amazon S3 exitosa");
    console.log("Archivo subido correctamente");
    console.log("Bucket:", process.env.AWS_S3_BUCKET);
  } catch (error) {
    console.error("Error al conectar con Amazon S3:");
    console.error(error.name, error.message);
  }
}

probarS3();