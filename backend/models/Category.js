const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name :{type:String, required:true, unique:true,trim:true, index:true},
    slug: {type:String, required:true, unique:true,trim:true, index:true,lowercase:true},
    description: {type:String},
},
{timestamps:true});

// Add pre-save hook to create slug from the name if needed

categorySchema.pre('validate', function(next){
    if (this.name && !this.slug) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    next();
});

module.exports = mongoose.model('Category', categorySchema);