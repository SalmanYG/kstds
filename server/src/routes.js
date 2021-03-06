
// to handle routes, first specify GET or POST
// params:
//  the route
//  callback has REQuest and RESponse
//  -> req holds the data in req.body
//  -> to send to the port use res.send
// set headers using 
//      res.set()
// send status code using
//      res.status(code).send(str)
module.exports = (app, conn) => {

	app.get('/teams', (req, res) => {

		// selects from db:
		// goals scored, received, points, rank of each team
		// res.send array of objects

		(async function() {
			let q = await conn.query(
				`
				SELECT * FROM Team
				`
			)

			console.log(q)
			let teams = []
			q.forEach(team => {
				teams.push(
					new Team(team.teamID, team.name, [])
				)
			})
			console.log(teams);
			res.status(200).send(teams)
			
		})()



		// let dummy = [
		// 	new Team(0, 'Team XXX', [], 0, 0, 0, 0),
		// 	new Team(1, 'Team YYY', [], 0, 0, 0, 0),
		// 	new Team(2, 'Team ZZZ', [], 0, 0, 0, 0)
		// ]

		console.log(`sedning teams array`)
		// res.send(dummy)

	})

	app.post('/teams', (req, res) => {
		// i dont`t know why i named this endpoint <teams>, it`s for goals
		// but i`m keeping it :\

		let q = req.query
		console.log(q);
		
		conn.query(
			`
			INSERT INTO Goals VALUES
			(
				${q.goal}, ${q.match},
				1, ${q.player}, ${q.time}
			)
			`
		)
		.then((res) => {
			console.log(`goal insert well, res: `)
			console.log(res)
			
			
		})
		.catch((err) => {
			console.log(`goal insert bad, err: `)
			console.log(err)
		})
		
		console.log(q.t);
		

		(async function() {
			let curr = await conn.query(
				`
				SELECT team${q.t}Goals AS g
				FROM Matcht
				WHERE matchID = ${q.match}
				`
			)
			console.log(`currrrr:`);
			
			console.log(curr);
			
			conn.query(
				`
				UPDATE Matcht SET team${q.t}Goals = ${(curr[0].g)+1}
				WHERE matchID = ${q.match};
				`
			)
			.then(res => {
				console.log(`goal update well`);
				console.log(res);
				
				
			})
			.catch(err => {
				console.log(`goal update bad`);
				console.log(err);
			})

		
		
		
		
		
			let count = await conn.query(
				`
				select count(playerID) as total
				from goals
				where playerID = ${q.player} and matchID=${q.match};
				`
			)

			console.log('coooouuunnttttt:');
			console.log(count);
			
			
		})()



		

		res.status(200).send()
		
	})

	
	app.get('/matches', (req, res) => {
		
		// selects from Match table:
		// data, field, time, referee, teams of each match
		// res.send array of objects
		(async function() {
			
			let q1 = 
			`
			SELECT 
			M.matchID AS id,
			M.datet AS date,
			M.team1Goals AS goals1,
			M.team2Goals AS goals2,
			M.refreeid AS referee,
			F.name AS field,
			T1.name AS team1,
			T1.teamID AS team1ID,
			T2.teamID AS team2ID,  
			T2.name AS team2
			FROM Matcht AS M
			JOIN Fieldt F ON M.fieldid = F.fieldID
			JOIN Team T1 ON M.team1id = T1.teamID
			JOIN Team T2 ON M.team2id = T2.teamID;
			`

			let qres = await conn.query(q1)
		
			
			
			
			let players1 = []
			let players2 = []
			let refs = []
			for await (match of qres) {
				
				let t1 = await conn.query(
					`
					SELECT P.playerid, A.fname, A.lname, P.goalstotal AS goals
					FROM PlayerTeams as PT
					Join Players P on PT.playerid = P.playerid
					JOIN Actor A ON P.kfupmid = A.kfupmID
					WHERE PT.teamid = ${match.team1ID};
					`
				)

				
				let arr1 = []
				t1.forEach(player => {
				arr1.push(
					new Player(player.playerid, player.fname, player.goals)
					)
				});
				
				players1.push(arr1)
				let t2 = await conn.query(
					`
					SELECT P.playerid, A.fname, A.lname, P.goalstotal AS goals
					FROM PlayerTeams as PT
					Join Players P on PT.playerid = P.playerid
					JOIN Actor A ON P.kfupmid = A.kfupmID
					WHERE PT.teamid = ${match.team2ID};
					`
				)
				
				let arr2 = []
				t2.forEach(player => {
					arr2.push(
						new Player(player.playerid, player.fname, player.goals)
					)
				});
				
				players2.push(arr2)









				let ref = await conn.query(
					`
					SELECT fname
					FROM actor
					WHERE kfupmid in (
						SELECT kfupmID
						FROM refree
						WHERE RefreeID = ${match.referee}
					)
					`
				)

				refs.push(ref[0].fname)








				// let count = await conn.query(
				// 	`
				// 	select count(playerID) as total
				// 	from goals
				// 	where playerID = ${q.player} and matchID=${q.match};
				// 	`
				// )
	
				// console.log('coooouuunnttttt:');
				// console.log(count);
				
				
				// conn.query(
				// 	`
				// 	update players set goalsTotal = ${count[0].total}
				// 	where playerID = ${q.player}
				// 	`
				// )
				// .then(res => {
				// 	console.log('total goasl update, res: ');
				// 	console.log(res);
					
					
				// })
				// .catch(err => {
				// 	console.log('total goasl update err, err: ');
				// 	console.log(err);
				// })

			}
			






			console.log('******************************************')
			let count;
			let count1 = []
			for (let i = 0; i < players1.length; i++) {
				let carr = []

				for (let j = 0; j < players1[i].length; j++) {

					count = await conn.query(
						`
						select count(playerID) as total
						from goals
						where playerID = ${players1[i][j].id} and matchID=${i+1};
						`
					)
					carr.push(count[0].total)
				}
				
				count1.push(carr)
				
			}
			console.log(count1);
			
			console.log('******************************************')

			console.log('******************************************')
			let count2 = []
			for (let i = 0; i < players2.length; i++) {
				let carr = []

				for (let j = 0; j < players2[i].length; j++) {

					count = await conn.query(
						`
						select count(playerID) as total
						from goals
						where playerID = ${players2[i][j].id} and matchID=${i+1};
						`
					)
					carr.push(count[0].total)
				}
				
				count2.push(carr)
				
			}
			console.log(count2);
			
			console.log('******************************************')




			
			




			console.log(refs);
			

			

			console.log('--------------');
			console.log(qres)
			console.log('--------------');
			console.log(players1)
			console.log('--------------');
			console.log(players2)
			console.log('--------------');


			let arr = []

			for (let i = 0; i < qres.length; i++) {
				

				for (let j = 0; j < players1.length; j++) {
					players1[i][j].goals = count1[i][j]
				}

				for (let j = 0; j < players2.length; j++) {
					players2[i][j].goals = count2[i][j]
				}


				arr.push(
					new Match(
						qres[i].id, (qres[i].date + '').substr(0, 15),
						new Team(qres[i].team1ID, qres[i].team1, players1[i]),
						new Team(qres[i].team2ID, qres[i].team2, players2[i]),
						qres[i].field, refs[i], qres[i].goals1, qres[i].goals2
					)
				)
			}

			console.log(arr)
			
			res.status(200).send(arr)
		})()

	})

	app.post('/matches', (req, res) => {
		let q = req.query
		console.log(q)
		

		conn.query(
			`
			INSERT INTO Matcht VALUES
			(
				${q.id}, ${q.team1}, ${q.team2},
				${q.field}, '${q.date}', ${q.time},
				0, 0, ${q.referee}
			)
			`
		)
		.then((res) => {
			console.log(`match insert wemt well, res: `)
			console.log(res)
			
			
		})
		.catch((err) => {
			console.log(`match insert didnt go well, err: `)
			console.log(err)
			
			
		})


		res.status(200).send()

		
		
		// inserts into Match table:
		// matchID, torID, date, time, teams, field, referee
		// data is in req.query
	})


	app.put('/fields', (req, res) => {

		// update the field of the given match
		// matchId, field ?
		// data is in req.query
		let q = req.query
		console.log(`q new field: ${q.field} with id: ${q.match}`);

		conn.query(
			`
			UPDATE Matcht 
			SET fieldid = ${q.field}
			WHERE matchid = ${q.match}
			`
			
		)
		.then(res => {
			console.log(`update field good. res: `)
			console.log(res)
			
			
		})
		.catch(err => {
			console.log(`update field bad. err: `)
			console.log(err)
		})

		
		res.status(200).send()

	})


	app.get('/players', (req, res) => {
		// selects from Goals and Player:
		// each player with more than 2 gaals
		// res.send array of objects


		(async function() {
			let q = await conn.query(
				`
				SELECT fname, lname
				FROM Actor
				WHERE kfupmID in (
					SELECT kfupmID
					FROM Players
					WHERE goalsTotal > 2
				);
				`
			)
			let arr = []
			let i = 0
			q.forEach(player => {
				arr.push(
					{
						id: i,
						first_name: player.fname,
						last_name: player.lname
					}
				)
				i++
			})

			console.log(q)
			
			res.status(200).send(arr)
		})()


		console.log(`sending highlight array`)
		
	})

	app.post('/players', (req, res) => {
		
		// inserts into Cards table:
		// cardID, playerID, cardType, cardDesc
		// data is in req.query
		let q = req.query
		console.log(`id: ${q.id}, card: ${q.card}, for: ${q.player}`);
		conn.query(
			`
			INSERT INTO Cards VALUES
			(${q.id}, ${q.player}, "${q.card}", 'none')
			`
		)
		.then(res => {
			console.log(`add card good, res: `)
			console.log(res)
			
			
		})	
		.catch(err => {
			console.log(`add card bad, err: `)
			console.log(err)
		})

		res.status(200).send()

	})

	app.get('/player', (req, res) => {
		
		// selects a player from db:
		// given team and given match
		// data is in req.query
		
		(async function() {
			if (req.query.team == '1') {
				let q = await conn.query(
					`
					SELECT fname, lname
					FROM Actor
					WHERE kfupmid in (
						SELECT kfupmid
						FROM Players
						WHERE playerid in (
							SELECT playerid
							FROM PlayerTeams
							WHERE teamid in (
								SELECT team1id
								FROM Matcht
								WHERE matchid = ${req.query.match}
							)
						)
					);
					`
				)
				console.log(q)
				let arr = []
				q.forEach(player => {
					arr.push(`${player.fname}`)
				})
				res.status(200).send(arr)
				
			}
			else if (req.query.team == 2) {
				let q = await conn.query(
					`
					SELECT fname, lname
					FROM Actor
					WHERE kfupmid in (
						SELECT kfupmid
						FROM Players
						WHERE playerid in (
							SELECT playerid
							FROM PlayerTeams
							WHERE teamid in (
								SELECT team2id
								FROM Matcht
								WHERE matchid = ${req.query.match}
							)
						)
					);
					`
				)
				console.log(q)
				let arr = []
				q.forEach(player => {
					arr.push(`${player.fname}`)
				})
				res.status(200).send(arr)
			}
	
		})()

		console.log(`team: ${req.query.team}, match: ${req.query.match}`)

	})


}



class Team {
  constructor(
    id, name, players=[], scored=0, recieved=0, points=0, rank=0
  ) {
    this.id = id
    this.name = name
    this.players = players
    this.scored = scored
    this.recieved = recieved
    this.points = points
    this.rank = rank
  }
}

class Match {
  constructor(
    id, date, team1, team2, field, ref, score1=0, score2=0
  ) {
      this.id = id
      this.date = date
      this.team1 = team1
      this.team2 = team2
      this.field = field
      this.score1 = score1
			this.score2 = score2,
			this.ref = ref
    }
}

// stripped version
class Player {
  constructor(
    id, name, goals
    ) {
      this.id = id
      this.name = name
      this.goals = goals
    }
}