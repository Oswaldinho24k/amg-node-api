const Exam = require("../models/Exam");
const controller = {};

function nowInMexico() { // in case we have to force TimeZone
	let now = new Date().getTime() // in server
	let localOffset = d.getTimezoneOffset() * 60000;
	let utc = localTime + localOffset;
	let offset = -5;   // just in summer if not the value is -6 for México
	let mx = utc + (3600000 * offset);
	return new Date(mx);
}

function beforeTime(time) {
	//let now = nowInMexico()	
	return Date.now() < Date.parse(time)
}

function afterTime(time) {
	//let now = nowInMexico()	
	return Date.now() > Date.parse(time)
}



controller.getExams = async (req, res) => {
	let exams = [];	
	let { limit, skip } = req.query
	exams = await Exam.find(req.query || {}).limit(Number(limit) || 0).skip(Number(skip) || 0).populate('event')
	return res.status(200).json(exams)
};

controller.postExam = async (req, res) => {
	const exam = await Exam.create(req.body);
	res.status(201).json(exam);
};


controller.getExam = async (req, res) => {	
	let { id: examId } = req.params	
	//if user is admin
	if (req.user.userType === 'Admin') {
		const examAdmin = await Exam.findById(req.params.id).populate('event')
		return res.status(200).json(examAdmin)
	}

	// 1.- check exam time to retreive if is allowed
	let exam = await Exam.findOne({ _id: examId }, { title: 1, questions: 1, startTime: 1, endTime: 1, "questions.question": 1, "questions.answers": 1, "questions._id": 1 })
	//return res.send(exam)
	if (!exam) return res.status(404).json({ message: "El examen no existe" });
	// If the user dd the exam already, we return the resolved
	//let exists = exam.resolved.find(r => r.user == req.user._id)
	let exists = await Exam.findOne({ _id: examId, "resolved.user": req.user._id }, { resolved: 1 })
	if (exists) {
		let answer = exists.resolved.find(a => String(a.user) === String(req.user._id))
		let oExam = exam.toObject()
		oExam.total = answer.total
		oExam.answers = answer.answers		
		if (answer) return res.status(200).json(oExam);
	}
	///
	if (afterTime(exam.startTime) && beforeTime(exam.endTime)) {
		// si puedeo enviarlo
		res.status(200).json(exam);
	} else if (beforeTime(exam.startTime)) {
		// envio mensaje de que aún no es tiempo
		res.status(400).json({ message: "El examen aún no esta activo", startTime: exam.startTime });
	} else {
		res.status(400).json({ message: "El examen ya no está disponible", endTime: exam.endTime });
	}
	// 2.- check if user is assistant ???
};


controller.answerExam = async (req, res) => {
	let { id: examId } = req.params
	let { answers = {
		"pregunta": "respuesta"
	} } = req.body
	let exam = await Exam.findById(examId)
	// 1.- check if it is still time

	if (afterTime(exam.endTime)) return res.status(400).json({ message: "El examen ya no está disponible" })

	// 2.- check if user is assistant ???? OR CHECK IF USER ALREADY ANSWER IT
	/////
	// 3.- Check question by qustion and add answers to the corresponding array
	let resolved = {
		//user: "5d2410a7fdb6ac0017f4578d", // token
		user: req.user._id, // token
		answers: [],
		total: 0
	}
	for (let q of exam.questions) {
		let a = {
			question: q.question,
			answer: answers[q.question],
			correct: answers[q.question] === q.correct
		}
		resolved.answers = [a, ...resolved.answers]
	}
	let total = resolved.answers.reduce((acc, a) => {
		if (a.correct) return acc + 1
		else return acc
	}, 0)
	resolved.total = `${total}/${exam.questions.length}`
	if (req.user.userType === 'Admin') {
		return res.status(200).json(resolved);
	}
	// 4.- set the grade inside exam in DB
	exam = await Exam.findByIdAndUpdate(req.params.id, { $push: { resolved } }, { new: true }) //.populate('resolved.user')
	// 5.-  and responde with corresponding answer
	res.status(200).json(resolved);
};

controller.updateExam = async (req, res) => {
	const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
	res.status(200).json(exam);
};

controller.deleteExam = async (req, res) => {
	const exam = await Exam.findByIdAndRemove(req.params.id);
	res.status(200).json(exam);
};

module.exports = controller;