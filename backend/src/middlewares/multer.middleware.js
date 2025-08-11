import multer from "multer"
import path from "path"
import fs from "fs"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop())
    }
})

// Image-specific storage configuration
const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'images')

        // Ensure directory exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true })
        }

        cb(null, uploadPath)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const ext = path.extname(file.originalname).toLowerCase()
        cb(null, `quiz-image-${uniqueSuffix}${ext}`)
    }
})

// File filter for images
const imageFileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
        return cb(null, true)
    } else {
        cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed'))
    }
}

export const upload = multer({
    storage,
})

export const uploadImage = multer({
    storage: imageStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: imageFileFilter
})