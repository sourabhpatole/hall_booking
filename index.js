const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());
//Data

var rooms = [];
var customers = [];

//Create Room
app.post("/createRoom", (req, res) => {
  try {
    id_room = `${rooms.length + 1}r`;
    var input_data = {
      seats: req.body.seats,
      price: req.body.price,
      amenities: req.body.amenities,
      id: id_room,
      bookings: [],
    };
    rooms.push(input_data);
    res.json({ message: "Room created!", roomID: id_room });
  } catch (err) {
    console.log(err);
  }
});

//Book Room
app.post("/bookRoom", function (req, res) {
  let flag = 0;
  id_customer = `${customers.length + 1}c`;
  var time_front_data = [req.body.start, req.body.end],
    dob_front = req.body.date; // Time and date of booking as provided by user
  try {
    if (rooms.length == 0) {
      throw "no room created";
    }
    rooms.forEach((room) => {
      flag++;
      //console.log("Searching in ",flag);
      if (room.seats == req.body.seats_req) {
        flag++;
        if (room.bookings.length == 0) {
          var temp_variable = {
            cust_id: id_customer,
            start: req.body.start,
            end: req.body.end,
            date: req.body.date,
          }; //Update booking info of room
          room.bookings.push(temp_variable);
          var customer = {
            name: req.body.name,
            customer_id: id_customer,
            date_of_booking: req.body.date,
            start_time: time_front_data[0],
            end_time: time_front_data[1],
            room_id: room.id,
          }; //Creating Customer entry
          //console.log("pushing customer data length 0");
          customers.push(customer);
          res.json(customer);
        } else {
          let check = 0;
          room.bookings.forEach((t) => {
            let time_back_data = [t.start, t.end],
              dob_back = t.date; // Time and date of booking already done
            if (clash(time_back_data, dob_back, time_front_data, dob_front)) {
              check = 1;
              throw "room booked";
            } else {
              return;
            }
          });
          if (check == 0) {
            var temp_variable = {
              cust_id: id_customer,
              start: req.body.start,
              end: req.body.end,
              date: req.body.date,
            }; //Update booking info of room
            room.bookings.push(temp_variable);
            var customer = {
              name: req.body.name,
              customer_id: id_customer,
              date_of_booking: req.body.date,
              start_time: time_front_data[0],
              end_time: time_front_data[1],
              room_id: room.id,
            }; //Creating Customer entry
            //console.log("pushing customer data length >0");
            customers.push(customer);
            res.json(customer);
          }
        }
      } else {
        if (flag == rooms.length) throw "no room with seats required available";
      }
    });
  } catch (err) {
    res.json({
      message: err + ",try again!",
    });
  }
});
// List rooms
app.get("/getrooms", (req, res) => {
  let temp = [];
  for (let i = 0; i < rooms.length; i++) {
    let displayRoom = { room_id: 0, number_of_bookings: 0, bookings: [] };
    displayRoom.room_id = rooms[i].id;
    displayRoom.number_of_bookings = rooms[i].bookings.length;
    for (let j = 0; j < customers.length; j++) {
      if (customers[j].room_id == rooms[i].id) {
        var temp_json = {};
        temp_json.customer_name = customers[j].name;
        temp_json.date = customers[j].date_of_booking;
        temp_json.start_time = customers[j].start_time;
        temp_json.end_time = customers[j].end_time;
        displayRoom.bookings.push(temp_json);
      }
    }
    temp.push(displayRoom);
  }
  res.send(temp);
});
//List customers
app.get("/getcustomers", (req, res) => {
  res.json(customers);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Backend Started");
});

// Function for checking time slot clash
function clash(t_back, d_back, t_front, d_front) {
  let flag = 0;
  if (d_back == d_front) {
    if (t_back[0] == t_front[0]) {
      flag = 1;
    } else if (
      (t_front[0] >= t_back[0] && t_front[0] < t_back[1]) ||
      (t_back[0] >= t_front[0] && t_back[0] <= t_front[1])
    ) {
      flag = 1;
    }
  } else {
    flag = 0;
  }
  return flag === 0 ? false : true;
}
