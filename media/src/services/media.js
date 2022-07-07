import mongoose from 'mongoose';
import fs from 'fs';
import gm from 'gm';
import path from 'path';
const __dirname = path.resolve();

import { SellerProfileRepository, ServiceMediaRepository } from "../database/repository/index.js"; // DB Repositories
import Messages from "../config/messages.js"; // Static response messages
import { logger } from '../utils/logs.js'; // Custom logger utility
const mediaServiceLog = logger.logs('seller-service'); // Logger for seller service

// Media upload service
const MediaService = {

    /**
     * Upload media files for seller or service types.
     * Validates, resizes, saves to DB, and returns formatted response.
     *
     * @param {formidable.IncomingForm} fileForm - Formidable instance configured for file parsing.
     * @param {Request} req - Express request object.
     * @returns {Object} - Structured API response.
     */
    Upload: async (fileForm, req) => {
        try {
            const [fields, files] = await fileForm.parse(req);

            // Validate if any files were uploaded
            if (!files?.upload || files.upload.length === 0) {
                return { data: {}, type: "error", message: Messages.FILE_MISSING };
            }

            const fileData = [];
            const responseData = [];

            for (const file of files.upload) {
                // Prepare DB record and response structure
                const data = createDataToSaveInDatabase(file, req.user, req.params.type);
                await generateThumbnail(file.filepath, `${__dirname}/public/temp/${data.thumbnail}`);

                fileData.push(data);
                responseData.push(createResponseData(data));
            }

            // Save all uploaded file records to database
            const repository = getModelsRepository(req.params.type);
            await repository.create(fileData);

            return {
                data: responseData,
                type: "success",
                message: Messages.FILE_SUCCESS
            };

        } catch (error) {
            // Handle known file upload errors
            let message = Messages.FILE_ERROR;
            if (error.code === 1) {
                message = Messages.FILE_TYPE;
            } else if (error.code === 1016) {
                message = Messages.FILE_SIZE;
            } else if (error.code === 1015) {
                message = Messages.FILE_LIMIT;
            }

            mediaServiceLog.error('Error while uploading file', error);

            return {
                data: {},
                type: "error",
                message
            };
        }
    }
};

export default MediaService;
