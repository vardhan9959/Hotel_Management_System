document.addEventListener("DOMContentLoaded", () => {
    
    const roomTypes = [
        { name: "Suite", start: 100, end: 125, ac: true },
        { name: "Deluxe", start: 200, end: 225, ac: true },
        { name: "Standard", start: 300, end: 350, ac: false },
        { name: "Family", start: 400, end: 410, ac: true },
        { name: "Penthouse", start: 500, end: 505, ac: true },
    ];

    const tableBody = document.getElementById("room-table-body");
    const roomSelect = document.getElementById("room-select");
    const cancelRoomSelect = document.getElementById("cancel-room-select");

    // Generate rooms based on the defined ranges
    const availableRooms = [];
    
    roomTypes.forEach(roomType => {
        for (let number = roomType.start; number <= roomType.end; number++) {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${roomType.name}</td>
                <td>${number}</td>
                <td>${roomType.ac ? "Yes" : "No"}</td>
                <td class="${availableRooms.includes(number) ? 'booked' : 'available'}">${availableRooms.includes(number) ? 'Booked' : 'Available'}</td> 
            `;
            tableBody.appendChild(row);

            // Populate the select dropdown with available rooms
            if (!availableRooms.includes(number)) {
                availableRooms.push(number);
                
                // Add to booking dropdown
                const option = document.createElement("option");
                option.value = number;
                option.textContent = `${roomType.name} ${number}`;
                roomSelect.appendChild(option);
                
                // Add to cancellation dropdown if it's available
                const cancelOption = document.createElement("option");
                cancelOption.value = number;
                cancelOption.textContent = `${roomType.name} ${number}`;
                cancelRoomSelect.appendChild(cancelOption);
            }
        }
    });

    // Handle booking form submission
    const bookingForm = document.getElementById("booking-form");
    bookingForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const selectedRoomNumber = roomSelect.value;
        
        // Simulate booking by removing the selected room from the dropdown and marking it as booked
        const optionToRemove = Array.from(roomSelect.options).find(option => option.value === selectedRoomNumber);
        
        if (optionToRemove) {
            optionToRemove.remove();
            
            // Update the table to show that this room is now booked
            const rows = tableBody.querySelectorAll('tr');
            rows.forEach(row => {
                if (row.cells[1].textContent === selectedRoomNumber) {
                    row.cells[3].textContent = 'Booked';
                    row.cells[3].className = 'booked'; // Change status color to red
                }
            });
            
            // Show success message
            const bookingMessage = document.getElementById("booking-message");
            bookingMessage.textContent = `Your booking is successful for room number ${selectedRoomNumber}!`;
            bookingMessage.style.color = "green"; // Change message color to green

            // Send booking data to the server including check-in and check-out times
            const bookingData = {
                room_number: selectedRoomNumber,
                check_in_date: document.getElementById("check-in-date").value,
                check_in_time: document.getElementById("check-in-time").value,
                check_out_date: document.getElementById("check-out-date").value,
                check_out_time: document.getElementById("check-out-time").value,
            };

            await fetch('/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData),
            });
            
            bookingForm.reset(); // Reset form fields
        }
    });

   // Handle cancellation form submission
   const cancelForm = document.getElementById("cancel-form");
   cancelForm.addEventListener("submit", async (e) => {
       e.preventDefault();
       
       const selectedCancelRoomNumber = cancelRoomSelect.value;

       // Send cancellation request to the server
       await fetch(`/cancel_booking/${selectedCancelRoomNumber}`, {
           method: 'DELETE',
       });

       // Show cancellation message and update UI accordingly
       const cancelMessageDiv = document.getElementById("cancel-message");
       cancelMessageDiv.textContent = `Booking for room number ${selectedCancelRoomNumber} has been canceled.`;
       cancelMessageDiv.style.color = "red"; // Change message color to red

       // Optionally update UI to reflect that the room is now available again.
       const rowsToUpdate = tableBody.querySelectorAll('tr');
       rowsToUpdate.forEach(row => {
           if (row.cells[1].textContent === selectedCancelRoomNumber) {
               row.cells[3].textContent = 'Available';
               row.cells[3].className = 'available'; // Change status color back to green
           }
       });

       // Optionally re-add the canceled room back to the select dropdown.
       const optionToAddBack = document.createElement("option");
       optionToAddBack.value = selectedCancelRoomNumber;
       optionToAddBack.textContent = `Room ${selectedCancelRoomNumber}`;
       cancelRoomSelect.appendChild(optionToAddBack);
   });

   // Handle user form submission
   const userForm = document.getElementById("user-form");
   userForm.addEventListener("submit", async (e) => {
       e.preventDefault();
       
       const userData = {
           name: document.getElementById("name").value,
           contact: document.getElementById("contact").value,
           email: document.getElementById("email").value,
       };

       await fetch('/users', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(userData),
       });

       alert("User details saved!");
       userForm.reset(); // Reset form fields
   });
});
