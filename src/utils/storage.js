/**
 * Simple in-memory storage for demo purposes
 * In production, use Redis or a database
 */

let offer = null;
let leads = [];
let results = [];

module.exports = {
  setOffer: (data) => { offer = data; },
  getOffer: () => offer,
  
  setLeads: (data) => { leads = data; },
  getLeads: () => leads,
  
  setResults: (data) => { results = data; },
  getResults: () => results,
  
  clear: () => {
    offer = null;
    leads = [];
    results = [];
  }
};