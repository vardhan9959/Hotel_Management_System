from flask import Flask, request, jsonify, render_template
from flask_pymongo import PyMongo
from bson.objectid import ObjectId

app = Flask(__name__)

# MongoDB Configuration
app.config["MONGO_URI"] = "mongodb://localhost:27017/hotel_management"  # Ensure this line is correct
mongo = PyMongo(app)

# Serve the main HTML page
@app.route('/')
def index():
    return render_template("index.html")

# Room Management
@app.route('/rooms', methods=['GET', 'POST'])
def manage_rooms():
    if request.method == 'POST':
        data = request.json
        room_id = mongo.db.rooms.insert_one(data).inserted_id
        return jsonify({"msg": "Room added", "id": str(room_id)}), 201
    
    rooms = list(mongo.db.rooms.find())
    for room in rooms:
        room["_id"] = str(room["_id"])
    return jsonify(rooms), 200

# Booking Management
@app.route('/bookings', methods=['GET', 'POST'])
def manage_bookings():
    if request.method == 'POST':
        data = request.json
        booking_id = mongo.db.bookings.insert_one(data).inserted_id
        
        # Update room status to booked
        mongo.db.rooms.update_one(
            {"room_number": data["room_number"]},
            {"$set": {"status": "Booked"}}
        )
        
        return jsonify({"msg": "Booking successful", "id": str(booking_id)}), 201
    
    bookings = list(mongo.db.bookings.find())
    for booking in bookings:
        booking["_id"] = str(booking["_id"])
    return jsonify(bookings), 200

# Cancel Booking
@app.route('/cancel_booking/<room_number>', methods=['DELETE'])
def cancel_booking(room_number):
    # Remove booking from the database (you can also pass booking ID if needed)
    mongo.db.bookings.delete_one({"room_number": room_number})

    # Update room status back to available
    mongo.db.rooms.update_one(
        {"room_number": room_number},
        {"$set": {"status": "Available"}}
    )

    return jsonify({"msg": "Booking canceled successfully."}), 200

# User Details
@app.route('/users', methods=['GET', 'POST'])
def manage_users():
    if request.method == 'POST':
        data = request.json
        user_id = mongo.db.users.insert_one(data).inserted_id
        return jsonify({"msg": "User saved", "id": str(user_id)}), 201
    
    users = list(mongo.db.users.find())
    for user in users:
        user["_id"] = str(user["_id"])
    return jsonify(users), 200

# Start the application directly (not recommended for production)
app.run(debug=True)
