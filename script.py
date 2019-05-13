import csv

with open('data/marvel-wikia-data.csv') as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')
    line_count = 0
    for row in csv_reader:
        if len(row) is not 13:
            print(len(row))