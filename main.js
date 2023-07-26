let quizTypes = Object.keys(questionData);


let currentQuestion = 0;
let currentQuizName = null;
let currentQuestions = null;

//If questions just got are initiated -> shuffle them

//If questions have already been initiated -> overwrite initiated question data with the locally saved data


function init() {
    loadItems();
    console.log("diese werte sollten 0 bzw null sein:");
    console.log(currentQuestion);
    console.log(currentQuizName);
    console.log(currentQuestions)
    if (currentQuestions != null) {
        setItemInvisible("startCard");
        setItemInvisible("selectQuizCard");
        setItemVisible("questionCard");
        renderQuiz();
    }
}

function showQuizSelection() {
    setItemInvisible("startCard");
    setItemVisible("selectQuizCard");
    document.getElementById("quizTypeButtons").innerHTML = getQuizOptionsHtml()
}

function saveItems() {
    let questionsText = JSON.stringify(currentQuestions);
    localStorage.setItem('questions', questionsText);
}


function selectQuizQuestions(givenQuizId) {
    currentQuestions=questionData[quizTypes[givenQuizId]];
    shuffleAllQuestions();
    init();
}


function getQuizOptionsHtml() {
    html = "";
    for (let i = 0; i < quizTypes.length; i++) {
        html += `<button class='btn btn-start' onclick='selectQuizQuestions(${i})'>${quizTypes[i]}</button>`;
    }
    return html;
}


function loadItems() {
    let questionsText = localStorage.getItem('questions');
    if (questionsText) {
        currentQuestions = JSON.parse(questionsText);
    }
}


function shuffleAllQuestions() {
    for (let i = 0; i < currentQuestions.length; i++) {
        currentQuestions[i]['Answers'] = shuffle(currentQuestions[i]['Answers']);
    }
}

function renderQuiz() {
    
    if (checkIfQuizComplete() == false) {
        renderQuestion();
        renderAnswers();
        renderProgress();
        saveItems(); //checken ob nötig
    } else {
        completeQuiz();
    }

}

function setItemVisible(cardId){
    document.getElementById(cardId).style = "";
}

function setItemInvisible(cardId){
    document.getElementById(cardId).style = "display: none;";
}


function renderQuestion() {
    document.getElementById("question-title").innerHTML = `Frage ${currentQuestion + 1}`;
    document.getElementById("question-text").innerHTML = currentQuestions[currentQuestion]["Question"];
}


function resetQuiz() {
    currentQuestion = 0;
    currentQuizName = null;
    currentQuestions = null;
    localStorage.removeItem("questions");
    setItemVisible("startCard");
    setItemInvisible("selectQuizCard");
    setItemInvisible("questionCard");
    setItemInvisible("resultCard");
    setItemInvisible("trophyImg");
    init();
}


function renderAnswers() {
    let answers = (currentQuestions[currentQuestion]["Answers"]);
    document.getElementById("answers").innerHTML = getAnswersHtml(answers);

    //If the User has already given an answer for this question
    if (currentQuestions[currentQuestion]["Selected"] != null) {
        checkQuestion(currentQuestions[currentQuestion]["Selected"]);

    }
}


function getAnswersHtml(answers) {
    let html = "";

    for (let i = 0; i < answers.length; i++) {
        html += `<div class="card-body">
        <button class="btn quiz-btn" id="answer_${i}" onClick="checkQuestion(${i})">${answers[i]}</button>
        </div>`;
    }

    return html;
}


function checkQuestion(answerId) {
    let answerState = answerValidation(answerId);

    if (answerState) {
        setAnswerCorrect(answerId);
        console.log("richtig");
    } else {
        setAnswerWrong(answerId);
        setTrueAnswerCorrect();
        console.log("falsch");
    }
    setSelectedAnswer(answerId);
}


function answerValidation(answerId) {
    console.log(currentQuestions[currentQuestion]["Answers"][answerId] == currentQuestions[currentQuestion]["CorrectAnswer"]);
    return currentQuestions[currentQuestion]["Answers"][answerId] == currentQuestions[currentQuestion]["CorrectAnswer"];
}


function setAnswerWrong(answerId) {
    document.getElementById(`answer_${answerId}`).classList.add('btn-danger');
}


function setSelectedAnswer(answerId) {
    currentQuestions[currentQuestion]["Selected"] = answerId;
    renderProgress();
    saveItems();
}


function setAnswerCorrect(answerId) {
    document.getElementById(`answer_${answerId}`).classList.add('btn-success');
}


function setTrueAnswerCorrect() {
    let answerState = false;
    for (let i = 0; i < currentQuestions[currentQuestion]["Answers"].length; i++) {
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
    return `Frage (${currentQuestion + 1} von ${currentQuestions.length})`;
}


function getProgressBarHtml() {
    if (currentQuestions.length > 0) {
        let progressValue = (getAnsweredQuestionsAmount() / currentQuestions.length) * 100;
        html = `<div class="progress">
            <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: ${progressValue}%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">${progressValue}%</div>
        </div>`;
    } else {
        html = ``;
    }
    return html;
}


function getAnsweredQuestionsAmount() {
    let amount = 0;
    for (const arrayElement of currentQuestions) {
        if (arrayElement["Selected"] != null) {
            amount++;
        }
    }
    return amount;
}


function checkIfQuizComplete() {
    if (getAnsweredQuestionsAmount() == currentQuestions.length) {
        return true;
    } else {
        return false;
    }
}

function getCorrectAnswersAmount() {
    let correctAnswers = 0;

    for (const arrayElement of currentQuestions) {
        if (arrayElement["Selected"] != null) {
            if (answerValidation(arrayElement["Selected"])) {
                correctAnswers++;
            }
        }
    }

    return correctAnswers;
}



function quizResultSimple() {
    let correctAnswers = getCorrectAnswersAmount();
    return `Your Score: ${correctAnswers} / ${currentQuestions.length}`;
}

function completeQuiz() {
    setItemVisible("resultCard");
    setItemVisible("trophyImg");
    setItemInvisible("questionCard");
    document.getElementById("result-text").innerHTML = quizResultSimple();
}


function goToNextQuestion() {
    if (currentQuestion < (currentQuestions.length - 1)) {
        currentQuestion++;
        renderQuiz();
    } else {
        if (checkIfQuizComplete()) {
            completeQuiz();
        }

    }
}

function goToPreviousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
    }
    renderQuiz();
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