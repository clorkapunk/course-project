const {google} = require("googleapis");
const fs = require("node:fs");
const { Readable } = require('readable-stream');

const SCOPE = ["https://www.googleapis.com/auth/drive"]

class GoogleDriveService {

    async authorize() {
        const jwtClient = new google.auth.JWT(
            process.env.GD_CLIENT_EMAIL,
            null,
            process.env.GD_PRIVATE_KEY,
            SCOPE
        )

        await jwtClient.authorize()

        return jwtClient
    }

    async uploadToGoogleDrive(file) {
        const auth = await this.authorize()

        const fileMetadata = {
            name: file.originalname,
            parents: [process.env.GD_PARENT_FOLDER_ID],
        };

        // const media = {
        //     mimeType: file.mimetype,
        //     body: fs.createReadStream(file.path),
        // };
        const media = {
            mimeType: file.mimetype,
            body: new Readable({
                read() {
                    this.push(file.buffer);
                    this.push(null);
                }
            })
        };

        const driveService = google.drive({version: "v3", auth});

        const response = await driveService.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: "id",
        });

        await driveService.permissions.create({
            fileId: response.data.id,
            requestBody: {
                role: "reader",
                type: "anyone",
            },
        })

        return `https://drive.google.com/thumbnail?id=${response.data.id}&sz=w1000`;
    };

    async deleteImage(imageUrl){
        const auth = await this.authorize()

        const urlObject = new URL(imageUrl);
        const searchParams = urlObject.searchParams;
        const id = searchParams.get('id');

        console.log("id: ", id)

        const driveService = google.drive({version: "v3", auth});

        const response = await driveService.files.delete({
            fileId: id
        })

        return response
    }
}

module.exports = new GoogleDriveService();
