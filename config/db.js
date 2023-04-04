import mongoose from "mongoose";
const { connect } = mongoose;

const connection = async () => {
  const { connection } = await connect(process.env.MONGO_URI);

  console.log(`Database is connect with ${connection.host}`);
};

export default connection;
