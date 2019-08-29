const Recurso = require("../models/Recurso");
const controller = {};

controller.getRecursos = async (req, res) => {
	
	let recursos = [];
	console.log(req.query)	
	let {query, limit, skip} = req.query
	if(query) query = JSON.parse(query)
	// si no hay query params mando todos
	recursos = await Recurso.find(query||{}).limit(Number(limit)||0).skip(Number(skip)||0).populate('user')
	return res.status(200).json(recursos)
};


controller.postRecurso = async (req, res) => {
	//testing	
	console.log(req.files, req.body)	
  req.body['user'] = req.user._id
  if(req.files){
		req.files.forEach(element => {
			if(req.body[`${element.fieldname}URLS`])req.body[`${element.fieldname}URLS`].push(element.secure_url)
			else req.body[`${element.fieldname}URLS`] = [element.secure_url]
		})
	}
	const recurso = await Recurso.create(req.body)
	recurso['user'] = req.user
	res.status(201).json(recurso);
};

controller.likerecurso = async (req, res) => {
  const recurso = await Recurso.findOne({_id:req.params.id,liked:{$in:[req.user._id]}})
  console.log(recurso)
  let liked
  if(recurso==null){
    liked = await Recurso.findByIdAndUpdate({_id:req.params.id}, {$push:{liked:req.user._id}}, {new:true}).populate('user')
    return res.status(200).json(liked)
  }else{
    liked = await Recurso.findByIdAndUpdate({_id:req.params.id}, {$pull:{liked:req.user._id}}, {new:true}).populate('user')
    return res.status(200).json(liked)
  }	
};

controller.getrecurso = async (req, res) => {  
  const recurso = await Recurso.findById(req.params.id);  
	res.status(200).json(recurso).populate('user');
};

controller.updaterecurso = async (req, res) => {
	const recurso = await Recurso.findByIdAndUpdate(req.params.id, {$set: req.body}, {new: true}).populate('user');
	res.status(200).json(recurso);
};

controller.deleterecurso = async (req, res) => {
	const recurso = await Recurso.findByIdAndRemove(req.params.id);
	res.status(200).json(recurso);
};

module.exports = controller;