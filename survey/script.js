const questions = "http://aniksa.github.io/js/survey/data.json";
class DataRadio{
	constructor(data, form){
		//this.form = form;
		this.question = document.createElement("p");
		this.question.textContent = data["question"];
		let btnSubmit = form.lastElementChild;
        btnSubmit.before(this.question);
		this.answers=[];
		for (let i=0; i< data["answers"].length; i++){
		    let type = data["type"] === 'text'?'number':'radio';
			this.answers.push(DataRadio.addAnswer(data["answers"][i], data["name"], i, type));
            btnSubmit.before(this.answers[i].a);
			btnSubmit.before(this.answers[i].l);
            btnSubmit.before(document.createElement('br'));
		}

	}
	static addAnswer(str, name, i, type){
		let ans = document.createElement('input');
		ans.setAttribute('type', type);
		ans.setAttribute('name', name);
        ans.setAttribute('data-id-answer', i);
		let id = name.toString() + i.toString();
		ans.id = id;
		let label = document.createElement('label');
		label.textContent = str;
		label.setAttribute('for', id);
        ans.setAttribute('placeholder', '[0.0 - 1.0]');
	//	if (type === 'text') ans.setAttribute('pattern','[01][.,]{0,1}[0-9]{0,2}');
		if (type === 'number') {
		    ans.setAttribute('min','0');
            ans.setAttribute('max','1');
            ans.setAttribute('step','0.01');
        }else { ans.setAttribute('required','true')}
		return {a: ans,l:label}; 
	}
}

const app = {
	form : document.forms.test,
	score : [],
	max: 4, //max number of options
	view: document.getElementById('result'),
	init(data){
	    this.email = data["email"];
	    document.body.children[0].textContent = data["title"];
        document.body.children[1].innerHTML = data["description"];
		for (let q of data["questions"]){
			new DataRadio(q, this.form );
		}
		this.form.onsubmit = this.calculate.bind(this);
	},
	calculate(e){
		e.preventDefault();
		for (let i=0; i<this.max; i++)
			this.score[i] = 0;
		for (let inp of this.form.elements){
			if (inp.hasAttribute('data-id-answer')) {
                let inc = 0;
                if (inp.type === "radio" && inp.checked)
                    inc = 1;
                if (inp.type === 'number')
                    inc = parseFloat(inp.value)||0;
                this.score[inp.dataset.idAnswer] += inc;
                //console.log(this.score);
            }
		}
		this.show();
		this.pushToDB();
	},
	show(){
		this.view.innerHTML = '';
        let scoreRounded = 0;
		for (let i = 0; i< this.score.length; i++){
            scoreRounded = +this.score[i].toFixed(3);
			this.view.innerHTML += `${i+1}: ${scoreRounded}<br/>`;
		}		
	},
    pushToDB() {
        const ref = firebase.database().ref();
            let name = this.form.elements["project-name"].value;
            let product = this.form.elements["project-product"].value;
            let answers = [];
            let answersQ = [];
            for (let inp of this.form.elements){
                //let numAns = inp.dataset.idAnswer;//parseInt(inp.name.slice(-1,1));
                if (inp.hasAttribute('data-id-answer')) {
                    let inc = 0;
                    if (inp.type === "radio")
                        inc = (inp.checked)? 1 : 0;
                    if (inp.type === 'number')
                        inc = parseFloat(inp.value)||0;
                    answersQ.push(inc);
                    if (inp.dataset.idAnswer == (this.max-1)){
                        answers.push(answersQ);
                        answersQ = [];
                    }
                    //console.log(this.score);
                }
            }
            ref.push({
                name: name,
                product: product,
                answers: answers
            });
            //document.querySelector("#signup-form").classList.add("hidden");
           // document.getElementById("status").innerHTML = "Дякуємо " + name + "! Чекайте на наші новини на " + email + ".";
    }
};

fetch(questions).then(response=> {return response.json();})
.then(data => {app.init(data);})
.catch(err => { console.log(err);});