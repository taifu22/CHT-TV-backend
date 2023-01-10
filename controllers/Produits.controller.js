const Produits = require('../schema/Products.schema');

//function pour récuperer tous les produits, on la mets dans la route get /routes/Produits
exports.getProduits = async (req, res) => {
    try {
        const produits = await Produits.find();
        res.status(200).json({
            status: 'success',
            data: produits
        })
    } catch (error) {
        console.log(error);
    }
}