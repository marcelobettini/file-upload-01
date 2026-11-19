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
        return res.status(400).json({
            error: 'Too many files uploaded. Maximum 3 files are allowed.',
        });
    }
    const status = err.status ?? 500;
    res.status(status).json({ error: status >= 500 ? 'Internal Server Error' : err.message });

}