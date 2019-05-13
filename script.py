import csv

with open('data/marvel-wikia-data.csv') as csv_file:
	csv_reader = csv.reader(csv_file, delimiter=',')
	line_count = 0
	f_deaths = 0
	m_deaths = 0
	o_deaths = 0
	f_num = 0
	m_num = 0
	o_num = 0
	next(csv_reader)
	for row in csv_reader:
		#7 is sex, 9 is gender
		if "Male" in row[7]:
			m_num += 1
			if "Deceased" in row[9]:
				m_deaths += 1
		elif "Female" in row[7]:
			f_num += 1
			if "Deceased" in row[9]:
				f_deaths += 1
		else:
			o_num += 1
			if "Deceased" in row[9]:
				o_deaths += 1

	print("m_num %s, m_deaths %s, f_num %s, f_deaths %s, o_num %s, o_deaths %s" % (m_num, m_deaths, f_num, f_deaths, o_num, o_deaths))