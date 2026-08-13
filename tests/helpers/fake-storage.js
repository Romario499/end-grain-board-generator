export class FakeStorage {
  constructor() {
    this.values = new Map();
    this.getError = null;
    this.setError = null;
  }

  getItem(key) {
    if (this.getError) throw this.getError;
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    if (this.setError) throw this.setError;
    this.values.set(key, String(value));
  }

  removeItem(key) {
    this.values.delete(key);
  }
}
