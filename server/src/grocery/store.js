import dataStore from 'nedb-promise';

const validateGrocery = (grocery) => {
  let errors = "Missing";
  if (!grocery.name)
    errors += " name";
  if (!grocery.amount) 
    errors += (errors === "Missing" ? " " : ", ") + "amount";
  if (!grocery.pricePerKg)
    errors += (errors === "Missing" ? " " : ", ") + "price per kg";
  if (errors !== "Missing") {
    throw new Error(errors);
  }
};

export class NoteStore {
  constructor({ filename, autoload }) {
    this.store = dataStore({ filename, autoload });
  }
  
  async find(props) {
    return this.store.find(props);
  }
  
  async findOne(props) {
    return this.store.findOne(props);
  }
  
  async insert(grocery) {
    validateGrocery(grocery);
    return this.store.insert(grocery);
  };
  
  async update(props, grocery) {
    validateGrocery(grocery);
    return this.store.update(props, grocery);
  }
  
  async remove(props) { 
    return this.store.remove(props);
  }
}

export default new NoteStore({ filename: './db/notes.json', autoload: true });