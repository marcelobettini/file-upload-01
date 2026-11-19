export function notFoundHandler(req, res) {
    res.status(404).json({ message: 'Resource not found' });
}

export function globalErrorHandler(err, req, res, next) {

    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            error: 'File size exceeds the limit of 2MB',
        });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        const singleUpload = req.route.path === '/upload-one';
        const expectedField = singleUpload ? 'file' : 'files';
        if (err.field !== expectedField) {
            return res.status(400).json({ error: `Use the '${expectedField}' field.` });
        }

        const message = singleUpload ? 'Send only one file.' : 'Send up to 3 files.';
        return res.status(400).json({ error: message });
    }
    const status = err.status ?? 500;
    res.status(status).json({ error: status >= 500 ? 'Internal Server Error' : err.message });

}
