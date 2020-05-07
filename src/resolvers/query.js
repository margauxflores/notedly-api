module.exports = {
  notes: async (parent, args, { models }) => {
    return await models.Note.find();
  },
  note: async (parent, args, { models }) => {
    return await models.Note.findById(args.id);
  },
  user: async (parent, { username }, { models }) => {
    return await models.User.findOne({ username });
  },
  users: async (parent, args, { models, user }) => {
    return await models.User.find({});
  },
  me: async (parent, args, { models, user }) => {
    return await models.User.findById(user.id);
  },
  noteFeed: async(parent, { cursor }, { models }) => {
    // Hardcode the limit to 10 items
    const limit = 10;
    // Set the default hasNextPage value to false
    let hasNextPage = false;
    // If no cursor is passed the default query will be empty, this will pull the newest notes from the db
    let cursorQuery = {};

    // If there is a cursor, our query will look for notes with an ObjectId less than that of the cursor
    if (cursor) {
      cursorQuery = { _id: { $lt: cursor } };
    }

    // Find the limit + 1 of notes in our db, sorted newest to oldest
    let notes = await models.Note.find(cursorQuery)
      .sort({ _id: -1 })
      .limit(limit + 1);

    // If the number of notes we find exceeds our limit, set hasNextPage to true and trim the notes to the limit  
    if (notes.length > limit) {
      hasNextPage = true;
      notes = notes.slice(0, -1);
    }

    // The new cursor will be the Mongo object ID of the last item in the feed array
    const newCursor = notes[notes.length - 1]._id;

    return {
      notes,
      cursor: newCursor,
      hasNextPage
    };
  }
};