var typeOfClimb = document.getElementById("typeOfClimb");

typeOfClimb.addEventListener("change", function() {
  var difficultySlider = document.getElementById("Difficulty");

  if (typeOfClimb.value === "Bouldering") {
    difficultySlider.min = 0;
    difficultySlider.max = 12;
    updateDifficultyValueBouldering(); // update the difficulty labels for bouldering
  } else {
    difficultySlider.min = 0;
    difficultySlider.max = 15; // increase the max value to accommodate all route difficulties
    updateDifficultyValueRoutes(); // update the difficulty labels for routes
  }

  updateDifficultyValue(); // update the difficulty value immediately
});

function updateDifficultyValue() {
  if (typeOfClimb.value === "Bouldering") {
    updateDifficultyValueBouldering();
  } else {
    updateDifficultyValueRoutes();
  }
}

function updateDifficultyValueBouldering() {
  var slider = document.getElementById("Difficulty");
  var output = document.getElementById("DifficultyValue");
  var input = document.getElementById("DifficultyInput");

  var boulderingDifficultyLabels = [
    "VB", "V0", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10"
  ];
  var difficultyValue = boulderingDifficultyLabels[slider.value];

  output.innerHTML = difficultyValue;
  input.value = difficultyValue; // Set the value of the hidden input field to the actual difficulty value
}

function updateDifficultyValueRoutes() {
  var slider = document.getElementById("Difficulty");
  var output = document.getElementById("DifficultyValue");
  var input = document.getElementById("DifficultyInput");

  var routesDifficultyLabels = [
    "5.8", "5.9", "5.9+", "5.10-", "5.10", "5.10+", "5.11-", "5.11", "5.11+", "5.12-", "5.12", "5.12+", "5.13-", "5.13", "5.13+", "5.14-"
  ];
  var difficultyValue = routesDifficultyLabels[slider.value];

  output.innerHTML = difficultyValue;
  input.value = difficultyValue; // Set the value of the hidden input field to the actual difficulty value
}

function updateAttemptsValue() {
  var attemptsSlider = document.getElementById("Attempts");
  var output = document.getElementById("AttemptsValue");

  output.innerHTML = attemptsSlider.value;
}