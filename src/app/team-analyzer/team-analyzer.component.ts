import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js';
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';
import * as $ from 'jquery';
import * as _ from "lodash";


import {trigger,state,style,transition,animate,keyframes} from '@angular/animations';




@Component({
  selector: 'app-team-analyzer',
  templateUrl: './team-analyzer.component.html',
  styleUrls: ['./team-analyzer.component.css'],
  animations: [
  	trigger('addCharacter', [
  		transition(':enter', [
  			style({opacity: '0'}),
  			animate('.5s ease-out', style({opacity: '1'})),
  			]),
  		transition(':leave', [
  			style({opacity: '1'}),
  			animate('.5s ease-out', style({opacity: '0'})),
  			]),
  		],
	)]
})

export class TeamAnalyzerComponent implements OnInit {
	characterCounter = 0;
	selectedCharacter = "";
	errorMessage = "";

	teamChart;
	individualChart;

	state = 'inactive';

	allCharacters = [];
	idealTeam = [320.13, 82.53, 299.05, 123.24, 107.99, 126.73]
	currentTeamDiff = [320.13, 82.53, 299.05, 123.24, 107.99, 126.73]

	currentRecommendations = [];



	colors = ["rgba(249,158,26, .5)", "rgba(33,143,254, .5)", "rgba(250,90,73, .5)", "rgba(102,174,52, .5", "rgba(167, 101, 185,.5)"]

	characterNames = [
	{
		name: 'Ana'
	},
	{
		name: 'Bastion'
	},
	{
		name: 'DVa'
	},
	{
		name: 'Doomfist'
	},
	{
		name: 'Genji'
	},
	{
		name: 'Hanzo'
	},
	{
		name: 'Junkrat'
	},
	{
		name: 'Lucio'
	},
	{
		name: 'McCree'
	},
	{
		name: 'Mei'
	},
	{
		name: 'Mercy'
	},
	{
		name: 'Orisa'
	},
	{
		name: 'Pharah'
	},
	{
		name: 'Reaper'
	},
	{
		name: 'Reinhardt'
	},
	{
		name: 'Roadhog'
	},
	{
		name: 'Soldier 76'
	},
	{
		name: 'Sombra'
	},
	{
		name: 'Symmetra'
	},
	{
		name: 'Torbjorn'
	},
	{
		name: 'Tracer'
	},
	{
		name: 'Widowmaker'
	},
	{
		name: 'Winston'
	},
	{
		name: 'Zarya'
	},
	{
		name: 'Zenyatta'
	}];
	

	radarData = {
	    labels: ['Damage', 'Disruption', 'Mobility', 'Protection', 'Healing', 'Sustain'],
	    datasets: []
	};

	radarDataAdditive = {
		labels: ['Damage', 'Disruption', 'Mobility', 'Protection', 'Healing', 'Sustain'],
		datasets: []
	};

	currentCharNames = []

  constructor(private http: Http) { 
  }

  ngOnInit() {
  	this.renderTeamRadarChart();
  	this.renderIndividualRadarChart();
  	this.grabAllCharacters();
  }

  	//This renders the radar chart that uses the radarDataAdditive set
	renderTeamRadarChart(){
		var teamRadarChart = $('#teamStats')[0].getContext('2d');
		var self = this;

		this.teamChart = new Chart(teamRadarChart, {
		type: 'radar',
		data: this.radarDataAdditive,
		options: {
			scale: {
				ticks: {
					min: -5,
					max: this.characterCounter * 100
				}
		},
        	legend: {
        		position: 'top',
          },
            tooltips: {
      			callbacks: {
        			label: function(tooltipItem, data) {
        				return data.datasets[tooltipItem.datasetIndex].label + ': ' + self.radarData.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
        			}
      			}
    		} 
		}
  	  })
	}

	//This renders the radar chart that uses the radarData set
	renderIndividualRadarChart(){
		var individualRadarChart = $('#individualStats')[0].getContext('2d');

		this.individualChart = new Chart(individualRadarChart, {
		type: 'radar',
		data: this.radarData,
		options: {
			scale: {
				ticks: {
					min: -5
				}
		},
        	legend: {
        		position: 'top',
          } 
		}
  	  })
	}
	

	addCharacter(){
		//Counts the number of character divs on the page
		var numChars = $('.charDiv').length

		//If there are six character divs the error message changes and the function stops
		if (numChars >= 6) {
			this.errorMessage = "You can't have more than six characters on a team"
		} else {
		this.http.get('http://localhost:3000/characters/' + this.selectedCharacter).subscribe(response => {
			var self = this
			var processedResponse = response.json()

			//Ends function if new character name is already in currentCharNames array
			for (let name of this.currentCharNames) {
				if (name === processedResponse.name) {
					self.errorMessage = "This character is already on the team"
					return "end search"
				}
			}
			var iterator = 0;

			var newCharacterStats = this.objectValuesToArrays(processedResponse.stats)


			var newCharacter = {
				label: processedResponse.name,
				borderColor: this.colors[numChars],
				backgroundColor: 'rgba(0,0,0,0)',
				image: '../../assets/Overwatch_Images/' + processedResponse.image,
				data: newCharacterStats
			}

			var additiveCharacter = {
				label: processedResponse.name,
				borderColor: this.colors[numChars],
				backgroundColor: 'rgba(0,0,0,0)',
				data: []
			}

			//This the array that contains the character objects. Each object has properties like 'label', 
			//'color', and 'data'
			var additiveCharData = this.radarDataAdditive.datasets;


			if (numChars === 0) {
				this.radarData.datasets.push(newCharacter)
				additiveCharData.push(newCharacter)
			} else {
				//Adds a character to the individual dataset
				this.radarData.datasets.push(newCharacter)

				//Takes the new dataset and adds it to the previous high dataset for additve stats
				for (let stat of newCharacter.data) {
					if (additiveCharData.length === 0) {
						stat = stat; 
					} else {
					stat = stat + additiveCharData[additiveCharData.length - 1].data[iterator]
				}
					additiveCharacter.data.push(stat)
					iterator++;
				}
				iterator = 0;
				this.radarDataAdditive.datasets.push(additiveCharacter)
		}
			this.currentCharNames.push(processedResponse.name);
			this.characterCounter++;
			this.teamChart.options.scale.ticks.max = 150 + (this.characterCounter * 50);
			// this.teamChart.tooltip._data.datasets[numChars] = this.radarData.datasets[numChars];
			this.teamChart.update();
			this.individualChart.update();
			this.selectedCharacter = "";
			this.errorMessage = "";
			this.calculateTeamDifference();
			this.calculateRecommendations();
		})
		}
	}


	removeCharacterDiv(character){
		var characterName = character.label
		var indexToRemove = this.radarDataAdditive.datasets.findIndex(character => character.label === characterName)
			var removedCharacter = this.radarData.datasets[indexToRemove].data
			var valuesToSubtract = this.radarDataAdditive.datasets
			for (var i = indexToRemove + 1; i < valuesToSubtract.length; i++){
				valuesToSubtract[i].data.forEach(function(item, index, arr){
					arr[index] = item - removedCharacter[index]
			})
		}
		this.currentCharNames.splice(indexToRemove, 1);
		this.radarDataAdditive.datasets.splice(indexToRemove, 1);
		this.radarData.datasets.splice(indexToRemove, 1);
		this.characterCounter--;
		this.teamChart.options.scale.ticks.max = 100 + (this.characterCounter * 60);
		this.teamChart.update();
		this.individualChart.update();
	}

	slideIn(){
        this.state = (this.state === 'inactive' ? 'active' : 'inactive');
	}

	grabAllCharacters(){
  		this.http.get('http://localhost:3000/characters').subscribe(response => {
  		this.allCharacters = response.json();
  		})
  	}

  	calculateRecommendations(){
		var availableCharacters = this.allCharacters;

		for (let name of this.currentCharNames){
			availableCharacters = availableCharacters.filter(character => character.name !== name )
		}

		var diffArray = []

  		for(var i = 0; i < availableCharacters.length; i++){

  			var charDiffArray = []
  			var charStats = this.objectValuesToArrays(availableCharacters[i].stats)


  			for (var i2 = 0; i2 < charStats.length; i2++){
  				var charDiff = this.currentTeamDiff[i2] - charStats[i2]
  				if(charDiff < 0) {
  					charDiff = charDiff * -.5
  				}

  				charDiffArray.push(charDiff)
  			}

  			var sum = charDiffArray.reduce((x, y) => x + y);

  			diffArray.push({
  				'name': availableCharacters[i].name,
  				'index': [i][0],
  				'statCont': sum
  			})
  		}

  		var sortedDiffArray = diffArray.sort(function(a,b){
  			return a.statCont - b.statCont;
  		});

  		this.currentRecommendations = [];

  		for (var i = 3; i > 0; i--)
  			this.currentRecommendations.push(sortedDiffArray[i].name)
  		console.log(this.currentRecommendations)
  	}

  	calculateTeamDifference(){
  		var calculatedDiff = []
  		for(var i = 0; i < this.idealTeam.length; i++) {
  			var newValue = this.idealTeam[i] - this.radarDataAdditive.datasets[this.radarDataAdditive.datasets.length-1].data[i]
  			calculatedDiff.push(newValue)
  		}
  		this.currentTeamDiff = calculatedDiff;
  		console.log(this.currentTeamDiff)
  	}

  	objectValuesToArrays(obj) {
  		return Object.keys(obj).map(function (key) { return obj[key]; });
  	}

  	addReccomendation(character) {
  		this.selectedCharacter = character;
  		this.addCharacter();
  	}



}
