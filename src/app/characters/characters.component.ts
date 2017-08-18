import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js';
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';
import * as $ from 'jquery';

import {trigger,state,style,transition,animate,keyframes, animateChild} from '@angular/animations';
import { stagger } from '@angular/animations';
import { query } from '@angular/animations';




class Character {
  id: String;
  name: String;
  role: String;
  image: String;
  health: Number;
  stats: Stats;
  description: String;
  quotes: Array<string>;
  abilities: any;
  portrait: String;
  constructor(){
	this.stats = {
		damage: 0,
	  	disruption: 0,
	  	mobility: 0,
	  	protection: 0,
	  	sustain: 0,
	  	healing: 0
  	}
  }
}

class Ability {
	id: String;
	name: String;
	description: String;
	image: String;
	character: String;
	abilityStats: Stats;
	constructor(){
		this.abilityStats = {
			damage: 0,
			disruption: 0,
			mobility: 0,
			protection: 0,
			sustain: 0,
			healing: 0
		}
		console.log('constructed')
	}
}

class Stats {
	damage: Number;
	disruption: Number;
	mobility: Number;
	protection: Number;
	sustain: Number;
	healing: Number;
}

@Component({
  selector: 'app-characters',
  templateUrl: './characters.component.html',
  styleUrls: ['./characters.component.css'],
  animations: [    
  	  trigger('abilityAnimation', [
      transition('* => *', [

        query(':enter', style({ opacity: 0 }), {optional: true}),

        query(':enter', stagger('300ms', [
          animate('.5s ease-in', keyframes([
            style({opacity: 0, transform: 'translateY(-75%)', offset: 0}),
            style({opacity: .5, transform: 'translateY(-30%)',  offset: 0.3}),
            style({opacity: 1, transform: 'translateY(0)',     offset: 1.0}),
          ]))]), {optional: true})
      ])
    ])

  ]

//   [
//   trigger('flyInOut', [
  	
//     state('in', style({transform: 'translateX(0)'})),
//     transition('void => *', [
//     query(':enter', [	
//     stagger(500, [
//       animate(2000, keyframes([
//         style({opacity: 0, transform: 'translateX(-100%)', offset: 0}),
//         style({opacity: 1, transform: 'translateX(15px)',  offset: 0.3}),
//         style({opacity: 1, transform: 'translateX(0)',     offset: 1.0})
//       ]))
//       ])
//     ]),
//     transition('* => void', [
//       animate(1000, keyframes([
//         style({opacity: 1, transform: 'translateX(0)',     offset: 0}),
//         style({opacity: 1, transform: 'translateX(-15px)', offset: 0.7}),
//         style({opacity: 0, transform: 'translateX(100%)',  offset: 1.0})
//       ]))
//     ])
//     ])
//   ])
// ]
})
export class CharactersComponent implements OnInit {

  selectedCharacter: Character = new Character()

  newAbility: Ability = new Ability()

  // abilities: Ability[] = [];



  constructor(private route: ActivatedRoute, private http: Http, private router: Router) {
  }

  characterName = ""

  generatedQuote = ""

  lastParam = ""

  next: number = 0;
  staggeringAbilities: any[] = [];
  abilitiesLength;



  individualRadarChart;

  characterStats = {
		labels: ['Damage', 'Disruption', 'Mobility', 'Protection', 'Healing', 'Sustain'],
		datasets: []
	};


  doNext() {
    if(this.next < this.abilitiesLength) {
      this.staggeringAbilities.push(this.selectedCharacter.abilities[this.next++]);
      console.log(this.staggeringAbilities)
    }
  }


  ngOnInit() {
  	this.route.params.subscribe(params => {
  		console.log(params.name)
  		if (params.name === this.lastParam) {
  		} else {
  			console.log('firing')
  			this.characterStats = {
				labels: ['Damage', 'Disruption', 'Mobility', 'Protection', 'Healing', 'Sustain'],
				datasets: []
			};
  			this.fetchCharacter(params.name)
  		}
  	})
  }

  fetchCharacter(name){
  	this.http.get('http://localhost:3000/characters/' + name).subscribe(response => {
  		var processedResponse = response.json()

  		this.selectedCharacter.name = processedResponse.name;
  		this.selectedCharacter.role = processedResponse.role;
  		this.selectedCharacter.image = processedResponse.image;

  		this.selectedCharacter.stats.damage = processedResponse.stats.damage;
  		this.selectedCharacter.stats.disruption = processedResponse.stats.disruption;
  		this.selectedCharacter.stats.protection = processedResponse.stats.protection;
  		this.selectedCharacter.stats.mobility = processedResponse.stats.mobility;
  		this.selectedCharacter.stats.healing = processedResponse.stats.healing;
  		this.selectedCharacter.stats.sustain = processedResponse.stats.sustain;


  		this.selectedCharacter.portrait = processedResponse.portrait;
  		this.selectedCharacter.health = processedResponse.health;
  		this.selectedCharacter.description = processedResponse.description;
  		this.selectedCharacter.quotes = processedResponse.quotes;
  		this.selectedCharacter.abilities = processedResponse.abilities;
  		this.selectedCharacter.id = processedResponse._id;

  		this.generateQuote()

  		function objectValuesToArray(obj) {
  			return Object.keys(obj).map(function (key) { return obj[key]; });
		}

		var newCharacterStats = objectValuesToArray(processedResponse.stats)

		var characterObj = {
			label: processedResponse.name,
			data: newCharacterStats,
			backgroundColor: 'rgba(249,158,26, .5)'
		}

		this.characterStats.datasets.push(characterObj)

		this.abilitiesLength = (this.selectedCharacter.abilities.length)
		console.log(this.abilitiesLength)

		this.lastParam = this.characterName;
		this.renderIndividualRadarChart();

  	})
  }

  generateQuote() {
  	var randomNum = Math.floor(Math.random());
  	this.generatedQuote = this.selectedCharacter.quotes[randomNum]
  }

  	renderIndividualRadarChart(){
		var individualRadarChart = $('#individualStats')[0].getContext('2d');

		new Chart(individualRadarChart, {
		type: 'radar',
		data: this.characterStats,
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

	postAbility(){
		this.newAbility.character = this.selectedCharacter.id;
		this.http.post('http://localhost:3000/ability', this.newAbility).subscribe(response => {
			console.log(response.json())
		})
	}


}