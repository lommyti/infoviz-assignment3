import csv

with open('data/marvel-wikia-data.csv') as csv_file:
	csv_reader = csv.reader(csv_file, delimiter=',')
	line_count = 0
	max_appearances = 0
	next(csv_reader)
	for row in csv_reader:
		print(row[-3])
		if row[-3] != '' and int(row[-3]) > max_appearances:
			max_appearances = int(row[-3])

	print(max_appearances)