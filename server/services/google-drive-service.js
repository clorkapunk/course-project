const {google} = require("googleapis");
const fs = require("node:fs");

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

        const media = {
            mimeType: file.mimetype,
            body: fs.createReadStream(file.path),
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

        return response.data.id;
    };
}

module.exports = new GoogleDriveService();
