import React, { useState } from "react";
import { Bar } from "react-chartjs-2"; // Import Bar chart component
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js"; // Import Chart.js components

// Register the necessary components with Chart.js
ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend
);

const App = () => {
	const [resources, setResources] = useState({
		printers: 0,
		faxes: 0,
		scanners: 0,
		tapeDrives: 0,
	});

	const [requests, setRequests] = useState(
		Array(4).fill({ printers: 0, faxes: 0, scanners: 0, tapeDrives: 0 })
	);
	const [results, setResults] = useState({
		available: {},
		onHold: {},
		deadlock: false,
		deadlockInfo: "",
		deadlockResources: [],
		recoverySuggestion: "",
	});

	const handleResourceChange = (e) => {
		setResources({ ...resources, [e.target.name]: Number(e.target.value) });
	};

	const handleRequestChange = (index, e) => {
		const newRequests = [...requests];
		newRequests[index][e.target.name] = Number(e.target.value);
		setRequests(newRequests);
	};

	const calculateResources = () => {
		let available = {
			printers: resources.printers,
			faxes: resources.faxes,
			scanners: resources.scanners,
			tapeDrives: resources.tapeDrives,
		};

		let onHold = requests.reduce(
			(acc, req) => {
				acc.printers += req.printers;
				acc.faxes += req.faxes;
				acc.scanners += req.scanners;
				acc.tapeDrives += req.tapeDrives;
				return acc;
			},
			{ printers: 0, faxes: 0, scanners: 0, tapeDrives: 0 }
		);

		available.printers -= onHold.printers;
		available.faxes -= onHold.faxes;
		available.scanners -= onHold.scanners;
		available.tapeDrives -= onHold.tapeDrives;

		// Deadlock detection logic
		const deadlockResources = [];
		const deadlock = Object.entries(onHold).some(([resource, holdAmount]) => {
			const availableAmount = available[resource];
			if (holdAmount > availableAmount) {
				deadlockResources.push(
					`${
						resource.charAt(0).toUpperCase() + resource.slice(1)
					} (Requested: ${holdAmount}, Available: ${availableAmount})`
				);
				return true;
			}
			return false;
		});

		const deadlockInfo = deadlock
			? "Deadlock detected due to insufficient resources for the following requests:"
			: "No deadlock detected. Resources are sufficient.";

		// Check for safe state using Banker's Algorithm
		const safeState = isSafeState(available, requests);
		const recoverySuggestion = deadlock
			? suggestRecovery(onHold, available)
			: "";

		setResults({
			available,
			onHold,
			deadlock,
			deadlockInfo,
			deadlockResources,
			recoverySuggestion,
		});
	};

	const isSafeState = (available, requests) => {
		const work = { ...available };
		const finish = Array(requests.length).fill(false);
		let safeSequence = [];

		while (safeSequence.length < requests.length) {
			let found = false;

			for (let i = 0; i < requests.length; i++) {
				if (!finish[i] && canAllocate(work, requests[i])) {
					safeSequence.push(i);
					finish[i] = true;
					work.printers += requests[i].printers;
					work.faxes += requests[i].faxes;
					work.scanners += requests[i].scanners;
					work.tapeDrives += requests[i].tapeDrives;
					found = true;
				}
			}

			if (!found) {
				// If no further allocation is possible, return false
				return false; // or you can return safeSequence if you want to indicate partial success
			}
		}

		return safeSequence; // Return the safe sequence if all processes can finish
	};

	const canAllocate = (work, request) => {
		return (
			work.printers >= request.printers &&
			work.faxes >= request.faxes &&
			work.scanners >= request.scanners &&
			work.tapeDrives >= request.tapeDrives
		);
	};

	const suggestRecovery = (onHold, available) => {
		let suggestions = [];

		for (let i = 0; i < requests.length; i++) {
			if (canAllocate(available, requests[i])) {
				suggestions.push(
					`Request from Employee ${
						i + 1
					} can be fulfilled. This will help in resolving the deadlock.`
				);
			}
		}

		return suggestions.length > 0
			? suggestions.join(" ")
			: "No recovery options available.";
	};

	// Data for the bar chart
	const chartData = {
		labels: ["Printers", "Faxes", "Scanners", "Tape Drives"],
		datasets: [
			{
				label: "Available Resources",
				data: [
					results.available.printers || 0,
					results.available.faxes || 0,
					results.available.scanners || 0,
					results.available.tapeDrives || 0,
				],
				backgroundColor: "rgba(75, 192, 192, 0.6)",
			},
			{
				label: "On Hold Resources",
				data: [
					results.onHold.printers || 0,
					results.onHold.faxes || 0,
					results.onHold.scanners || 0,
					results.onHold.tapeDrives || 0,
				],
				backgroundColor: "rgba(255, 206, 86, 0.6)",
			},
		],
	};

	return (
		<>
			<nav className="bg-blue-950 p-4 text-white flex justify-between">
				<div className="text-2xl font-bold">
					Resource Usage and Deadlock Detection
				</div>
				<div>
					<p>
						<a
							href="https://www.github.com/huzaif2309"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:underline"
						>
							Mohammed Huzaif S
						</a>{" "}
						1RV23IS073
					</p>
				</div>
			</nav>
			<div className="flex flex-col justify-center items-center bg-gray-100">
				<h2 className="text-xl font-semibold p-5">Enter Total Resources</h2>
				<div className="mx-5">
					<input
						type="number"
						name="printers"
						placeholder="Printers"
						onChange={handleResourceChange}
						className="border p-2 m-2"
					/>
					<input
						type="number"
						name="faxes"
						placeholder="Faxes"
						onChange={handleResourceChange}
						className="border p-2 m-2"
					/>
					<input
						type="number"
						name="scanners"
						placeholder="Scanners"
						onChange={handleResourceChange}
						className="border p-2 m-2"
					/>
					<input
						type="number"
						name="tapeDrives"
						placeholder="Tape Drives"
						onChange={handleResourceChange}
						className="border p-2 m-2"
					/>
				</div>

				<h2 className="text-xl font-semibold p-5">
					Enter Resource Requirements for Employees
				</h2>
				{["Kashyap", "Mandeep", "Sharath", "AJ"].map((name, index) => (
					<div key={index} className="mb-2">
						<h3 className="font-medium mx-4 p-2">{name}</h3>
						<input
							type="number"
							name="printers"
							placeholder="Printers"
							onChange={(e) => handleRequestChange(index, e)}
							className="border p-2 m-2 ml-6"
						/>
						<input
							type="number"
							name="faxes"
							placeholder="Faxes"
							onChange={(e) => handleRequestChange(index, e)}
							className="border p-2 m-2 ml-6"
						/>
						<input
							type="number"
							name="scanners"
							placeholder="Scanners"
							onChange={(e) => handleRequestChange(index, e)}
							className="border p-2 m-2 ml-6"
						/>
						<input
							type="number"
							name="tapeDrives"
							placeholder="Tape Drives"
							onChange={(e) => handleRequestChange(index, e)}
							className="border p-2 m-2 ml-6"
						/>
					</div>
				))}

				<button
					onClick={calculateResources}
					className="bg-blue-500 text-white p-2 rounded mt-4"
				>
					Calculate Resources
				</button>

				<div className="mt-5 p-4 rounded shadow bg-white mb-6">
					<h2 className="text-xl font-semibold">Results</h2>
					<div className="mt-2 flex flex-col justify-center items-center space-y-4">
						<div className="font-semibold bg-green-200 px-2 py-1 rounded-md w-fit">
							Available Resources
						</div>
						<div className="flex flex-row space-x-10 w-[40vw]">
							<div className="p-1 text-center border-[1px] w-1/4 border-green-600 bg-green-50 rounded-md">
								Printers
								<p className="font-bold text-center">
									{results.available.printers}
								</p>
							</div>
							<div className="p-1 text-center border-[1px] w-1/4 border-green-600 bg-green-50 rounded-md">
								Faxes
								<p className="font-bold text-center ">
									{results.available.faxes}
								</p>
							</div>
							<div className="p-1 text-center border-[1px] w-1/4 border-green-600 bg-green-50 rounded-md">
								Scanners
								<p className="font-bold text-center ">
									{results.available.scanners}
								</p>
							</div>
							<div className="p-1 border-[1px] w-1/4 text-center border-green-600 bg-green-50 rounded-md">
								Tape Drives
								<p className="font-bold text-center ">
									{results.available.tapeDrives}
								</p>
							</div>
						</div>
					</div>

					<div className="mt-6 flex flex-col justify-center items-center space-y-4">
						<div className="font-semibold bg-yellow-200 px-2 py-1 rounded-md w-fit">
							On Hold Resources
						</div>
						<div className="flex flex-row space-x-10 w-[40vw]">
							<div className="p-1 text-center border-[1px] w-1/4 border-yellow-600 bg-yellow-50 rounded-md">
								Printers
								<p className="font-bold text-center">
									{results.onHold.printers}
								</p>
							</div>
							<div className="p-1 text-center border-[1px] w-1/4 border-yellow-600 bg-yellow-50 rounded-md">
								Faxes
								<p className="font-bold text-center">{results.onHold.faxes}</p>
							</div>
							<div className="p-1 text-center border-[1px] w-1/4 border-yellow-600 bg-yellow-50 rounded-md">
								Scanners
								<p className="font-bold text-center">
									{results.onHold.scanners}
								</p>
							</div>
							<div className="p-1 border-[1px] w-1/4 text-center border-yellow-600 bg-yellow-50 rounded-md">
								Tape Drives
								<p className="font-bold text-center">
									{results.onHold.tapeDrives}
								</p>
							</div>
						</div>
					</div>
					<div className="mt-2">
						<span className="font-semibold">Deadlock Status: </span>
						<span
							className={`font-extrabold text-xl ${
								results.deadlock ? "text-red-500" : "text-green-700"
							}`}
						>
							{results.deadlock ? "Deadlock Detected" : "No Deadlock"}
						</span>
						<p>{results.deadlockInfo}</p>
						{results.deadlock && (
							<div>
								<h4 className="font-medium mt-2">
									Resources Causing Deadlock:
								</h4>
								<ul className="list-disc list-inside">
									{results.deadlockResources.map((resource, index) => (
										<li key={index}>{resource}</li>
									))}
								</ul>
							</div>
						)}
					</div>
				</div>

				{/* Bar Chart for Available and On Hold Resources */}
				<div className="mt-6 p-4 rounded shadow bg-white mb-6 w-[40vw]">
					<h2 className="text-xl font-semibold">Resource Bar Chart</h2>
					<Bar data={chartData} options={{ responsive: true }} />
				</div>
			</div>
		</>
	);
};

export default App;
