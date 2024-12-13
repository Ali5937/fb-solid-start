package main

import (
	"bufio"
	"flag"
	"fmt"
	"log"
	"os"
	"strings"
)

func main() {
	allFlag := flag.Bool("all", false, "Run all of the database creation and seed steps")
	dbFlag := flag.Bool("db", false, "Create the database")
	gisTablesFlag := flag.Bool("gis-tables", false, "Create the GIS tables")
	tablesFlag := flag.Bool("tables", false, "Create the tables")
	seedUsersFlag := flag.Bool("seed-users", false, "Seed users into database")
	seedItemsFlag := flag.Bool("seed-items", false, "Seed items into database")

	flag.Parse()

	if *allFlag || *dbFlag {
		createDatabase()
	}
	if *allFlag || *gisTablesFlag {
		createGisTables()
	}
	if *allFlag || *tablesFlag {
		createTables()
	}
	if *allFlag || *seedUsersFlag {
		seedUsers()
	}
	if *allFlag || *seedItemsFlag {
		if askConfirmation("Are you sure you want to seed the items?") {
			seedItems()
		}
	}

	if !*allFlag && !*dbFlag && !*gisTablesFlag && !*tablesFlag && !*seedUsersFlag && !*seedItemsFlag {
		log.Fatalf(`
			Error no flag Provided.
			Use -all to run all of the database creation and seed steps.
			Alternatively use -db, -gis-tables, -tables for the individual steps`)
	}
}

func askConfirmation(prompt string) bool {
	reader := bufio.NewReader(os.Stdin)
	fmt.Print(prompt + " (y/n): ")
	input, _ := reader.ReadString('\n')
	input = strings.TrimSpace(input)
	return input == "y" || input == "yes"
}
