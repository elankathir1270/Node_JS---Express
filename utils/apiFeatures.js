class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    //if need to delete some fields in req.query(useful mongodb below v7)
    const excludeFields = ["sort", "page", "limit", "fields"];
    const queryObjCopy = { ...this.queryStr };

    excludeFields.forEach((el) => {
      delete queryObjCopy[el];
    });

    //Filtering logic
    let queryString = JSON.stringify(queryObjCopy);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    const queryObj = JSON.parse(queryString);

    this.query = this.query.find(queryObj);

    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitingFields() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v"); // '-' indicates exclude field.
    }
    return this;
  }

  paginate() {
    const page = this.queryStr.page * 1;
    const limit = this.queryStr.limit * 1;

    //page 1: 1-10, page 2: 11-20, page 3: 21-30
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    // if (this.queryStr.page) {
    //   const moviesCount = await Movie.countDocuments();
    //   if (skip >= moviesCount) {
    //     throw new Error("This page is not found");
    //   }
    // }

    return this;
  }
}

module.exports = ApiFeatures;
