module.exports = {
  testInput: {
  },

  testOutputFn: function (input, actualOutput) {
    // validate the actualOutput against expected output
    // return a rejected promise to fail the validation or a resolved promise for success
    // return Promise.reject(new Error('Validation successful'))
    return actualOutput;
    //return Promise.reject(new Error('Validation failed'))
  }
}
