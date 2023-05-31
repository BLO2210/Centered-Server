const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const moment = require('moment');

app.use(express.json())
app.use(cors())

const User = require('./schemas/user')

mongoose.connect('mongodb+srv://centeredappdevs:C4h3f1cyrtoDR6rz@cluster0.awbfnpy.mongodb.net/?retryWrites=true&w=majority')
  .then(() => {
    console.log('DB connected')
  }).catch((error) => {
    console.log(error)
  })

function getWeekDates() {
  let now = new Date();
  let dayOfWeek = now.getDay();
  let numDay = now.getDate();

  let start = new Date(now); //copy
  start.setDate(numDay - dayOfWeek);
  start.setHours(0, 0, 0, 0);

  let end = new Date(now); //copy
  end.setDate(numDay + (7 - dayOfWeek));
  end.setHours(23, 59, 59, 999);

  return [start, end];
}

app.post('/register', async (req, res) => {
  const username = req.body.username
  const password = req.body.password

  const user = new User({
    username: username,
    password: password
  })
  const salt = await bcrypt.genSalt(10)

  const passwordHash = await bcrypt.hash(password, salt)
  user.password = passwordHash;

  try {
    await user.save()
    res.status(200).json({ message: 'Registration successful' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

app.post('/login', (req, res) => {
  const { username, password } = req.body

  User.findOne({ username })
    .then(user => {
      console.log(user)
      if (!user) {
        return res.state(401).json({ success: false, message: 'Incorrect username' })
      }
      bcrypt.compare(password, user.password)
        .then(result => {
          console.log(result)
          if (!result) {
            return res.status(401).json({ success: false, message: 'Incorrect password' })
          }

          const token = jwt.sign({ username }, 'SECRETKEY')
          res.json({ success: true, token, userId: user._id })
        })
        .catch(err => {
          return res.status(500).json({ success: false, message: 'Internal server error' })
        })
    })
    .catch(err => {
      return res.status(500).json({ success: false, message: 'Internal server error' })
    })
})
//old
// app.post('/api/mood-rating', async (req, res) => {
//   const rating = req.body.rating
//   const userId = req.body.userId

//   try {
//     const user = await User.findById(userId)

//     if (!user) {
//       return res.status(404).json({error: 'User not found'})
//     }
//     user.moodRatings.push({rating})
//     await user.save()
//     return res.status(200).json({message: 'Mood Logged'})
//   } catch (error) {
//     console.error(error)
//     return res.status(500).json({error: 'Server error'})
//   }
// })

app.post('/api/mood-rating', async (req, res) => {
  const rating = req.body.rating;
  const sleepQuality = req.body.sleepQuality;
  const productivityRating = req.body.productivityRating; // new
  const nutritionRating = req.body.nutritionRating; // new
  const userId = req.body.userId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.moodRatings.push({ rating, sleepQuality, productivityRating, nutritionRating }); // updated
    await user.save();
    return res.status(200).json({ message: 'Mood, Sleep Quality, Productivity, and Nutrition Rating Logged' }); // updated
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const id = req.params.id; // get the ID from the request parameters
    const user = await User.findById(id); // find the user with this ID
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/productivity/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const today = moment().startOf('day');
    const weekStart = today.clone().subtract(today.day(), 'days');
    const weekEnd = weekStart.clone().add(6, 'days');

    const thisWeeksRatings = user.moodRatings.filter((rating) => {
      const ratingDate = moment(rating.timestamp);
      return ratingDate.isBetween(weekStart, weekEnd, null, '[]');
    });

    const total = thisWeeksRatings.reduce((total, rating) => total + rating.productivityRating, 0);
    const average = total / thisWeeksRatings.length || 0; // The || 0 handles case where thisWeeksRatings.length is 0 to avoid NaN

    res.json({ averageProductivity: average });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});






app.get('/api/mood-rating/:userId/:date', async (req, res) => {
  const { userId, date } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const moodRating = user.moodRatings.find((rating) => rating.timestamp.toISOString().split('T')[0] === date);
    if (!moodRating) {
      return res.status(404).json({ message: 'Mood rating not found for the specified date' });
    }

    res.json({
      id: moodRating._id,
      rating: moodRating.rating,
      sleepQuality: moodRating.sleepQuality,
      productivityRating: moodRating.productivityRating,
      nutritionRating: moodRating.nutritionRating,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});





  // workshop below

  app.get('/api/mood-rating/:userId/:date', async (req, res) => {
    const { userId, date } = req.params;
  
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const moodRating = user.moodRatings.find((rating) => rating.timestamp.toISOString().split('T')[0] === date);
      if (!moodRating) {
        return res.status(404).json({ message: 'Mood rating not found for the specified date' });
      }
  
      res.json({
        id: moodRating._id,
        rating: moodRating.rating,
        sleepQuality: moodRating.sleepQuality,
        productivityRating: moodRating.productivityRating,
        nutritionRating: moodRating.nutritionRating,
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
//   useEffect(() => {
//     const userId = localStorage.getItem('userId');
//     const date = new Date().toISOString().split('T')[0];

//     fetch(http://localhost:8080/api/mood-rating/${userId}/${date})
//         .then((response) => response.json())
//         .then((data) => {
//             if (data) {
//                 setFormId(data.id);
//                 setRating(data.rating);
//                 setSleepQuality(data.sleepQuality);
//                 setProductivityRating(data.productivityRating);
//                 setNutritionRating(data.nutritionRating);
//             }
//         })
//         .catch((error) => {
//             console.error('Error:', error);
//         });
// }, []);

app.listen(8080, () => {
  console.log('Server is up')
})