let currentQuestion = 0;

//If questions just got are initiated -> shuffle them
shuffleAllQuestions();

//If questions have already been initiated -> overwrite initiated question data with the locally saved data
loadItems();




function init() {
    render();
}

function saveItems() {
    let questionsText = JSON.stringify(questions);
    localStorage.setItem('questions', questionsText);
}

function loadItems() {
    let questionsText = localStorage.getItem('questions');
    if (questionsText) {
        questions = JSON.parse(questionsText);
    }
}


function shuffleAllQuestions() {
    for (let i = 0; i < questions.length; i++) {
        questions[i]['Answers'] = shuffle(questions[i]['Answers']);
    }
}

function render() {
    renderQuestion();
    renderAnswers();
    renderProgress();
    saveItems();
}


function renderQuestion() {
    document.getElementById("question-title").innerHTML = `Frage ${currentQuestion + 1}`;
    document.getElementById("question-text").innerHTML = questions[currentQuestion]["Question"];
}


function renderAnswers() {
    let answers = (questions[currentQuestion]["Answers"]);
    document.getElementById("answers").innerHTML = getAnswersHtml(answers);

    //If the User has already given an answer for this question
    if(questions[currentQuestion]["Selected"]!=null){
        checkQuestion(questions[currentQuestion]["Selected"]);

    }
}


function getAnswersHtml(answers) {
    let html = "";
    
    for (let i = 0; i < answers.length; i++) {
        html += `<div class="card-body">
        <button class="btn" id="answer_${i}" onClick="checkQuestion(${i})">${answers[i]}</p>
        </div>`;
    }
    
    return html;
}


function checkQuestion(answerId) {
    let answerState = answerValidation(answerId);
    
    if (answerState) {
        setAnswerCorrect(answerId);
    } else {
        setAnswerWrong(answerId);
        setTrueAnswerCorrect();
    }
    setSelectedAnswer(answerId);
}


function answerValidation(answerId) {
    return questions[currentQuestion]["Answers"][answerId] == questions[currentQuestion]["CorrectAnswer"];
}


function setAnswerWrong(answerId) {
    document.getElementById(`answer_${answerId}`).classList.add('btn-danger');
}


function setSelectedAnswer(answerId){
    questions[currentQuestion]["Selected"]=answerId;
    renderProgress();
    saveItems();
}

function setAnswerCorrect(answerId) {
    document.getElementById(`answer_${answerId}`).classList.add('btn-success');
}


function setTrueAnswerCorrect() {
    let answerState = false;
    for (let i = 0; i < questions[currentQuestion]["Answers"].length; i++) {
        answerState = answerValidation([i]);
        if (answerState) {
            setAnswerCorrect(i);
            break;
        };
    }
}


function renderProgress() {
    document.getElementById("progress-bar").innerHTML = getProgressBarHtml();
    document.getElementById("progress-text").innerHTML = getProgressInformationHtml();
}


function getProgressInformationHtml() {
    return `Frage (${currentQuestion + 1} von ${questions.length})`;
}


function getProgressBarHtml() {
    if (questions.length > 0) {
        let progressValue = (getAnsweredQuestionsAmount() / questions.length) * 100;
        html = `<div class="progress">
            <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: ${progressValue}%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">${progressValue}%</div>
        </div>`;
    } else {
        html = ``;
    }
    return html;
}


function getAnsweredQuestionsAmount() {
    amount = 0;
    for (const arrayElement of questions) {
        if (arrayElement["Selected"] != null) {
            amount++;
        }
    }
    return amount;
}


function goToNextQuestion() {
    if (currentQuestion < (questions.length - 1)) {
        currentQuestion++;
        render();
    } else {
        if (getAnsweredQuestionsAmount() == questions.length) {
            completeQuiz();
        }
    }
}

function completeQuiz() {
    document.getElementById("resultCard").style="";
    document.getElementById("questionCard").style="display: none;";
}

function goToPreviousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
    }
    render();
}

function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}