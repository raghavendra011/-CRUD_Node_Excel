const xlsx = require('xlsx');
const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;

app.use(express.json());
app.use(cors());

// Read data from the Excel file
function readData() {
  const workbook = xlsx.readFile('data.xlsx');
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  return xlsx.utils.sheet_to_json(worksheet, { defval: null });
}

// Save data to the Excel file
function saveData(data) {
  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet(data);
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  xlsx.writeFile(workbook, 'data.xlsx');
}

// Create a new phone number
app.post('/add-phone', (req, res) => {
  try {
    const data = readData();
    const nextSerialId = data.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;
    const phoneNumber = { ...req.body, id: nextSerialId };
    data.push(phoneNumber);
    saveData(data);
    res.status(201).json({
      status: 'Success',
      data: {
        phoneNumber,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'Failed',
      message: err,
    });
  }
});

// Update a phone number by ID
app.put('/update-phone/:id', (req, res) => {
  const { id } = req.params;
  const updatedPhoneNumber = req.body;

  try {
    const data = readData();
    const phoneToUpdateIndex = data.findIndex((phone) => phone.id === parseInt(id));
    if (phoneToUpdateIndex === -1) {
      return res.status(404).json({
        status: 'Failed',
        message: 'Phone number not found',
      });
    }

    // Update the phone number data
    data[phoneToUpdateIndex] = { ...data[phoneToUpdateIndex], ...updatedPhoneNumber };

    saveData(data); // Save the updated data to the file

    res.status(200).json({
      status: 'Success',
      data: {
        phoneNumber: data[phoneToUpdateIndex],
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'Failed',
      message: err,
    });
  }
});

// ... (rest of the code remains the same)


// Delete a phone number by ID
app.delete('/delete-phone/:id', (req, res) => {
  const { id } = req.params;
  try {
    const data = readData();
    const phoneToDeleteIndex = data.findIndex((phone) => phone.id === parseInt(id));
    if (phoneToDeleteIndex === -1) {
      return res.status(404).json({
        status: 'Failed',
        message: 'Phone number not found',
      });
    }

    // Remove the phone number from the data array
    data.splice(phoneToDeleteIndex, 1);

    saveData(data); // Save the updated data to the file

    res.status(200).json({
      status: 'Success',
      message: 'Phone number deleted successfully',
    });
  } catch (err) {
    res.status(500).json({
      status: 'Failed',
      message: err,
    });
  }
});

// Get all phone numbers
app.get('/get-phones', (req, res) => {
  try {
    const data = readData();
    res.status(200).json({
      status: 'Success',
      data: {
        phones: data,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'Failed',
      message: err,
    });
  }
});

// Route to handle the root path ("/")
app.get('/', (req, res) => {
  res.send(`Server is running on port ${port}`);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
