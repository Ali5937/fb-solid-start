package utils

import (
	"fmt"
	"strings"
)

func ParseTypeStringArray(str string) ([]int, error) {
	var numArr []int
	for i, s := range strings.Split(str, ",") {
		if i > 3 {
			return nil, fmt.Errorf("more than 3 numbers as type")
		}
		var num int
		_, err := fmt.Sscanf(s, "%d", &num)
		if err != nil {
			return nil, fmt.Errorf("scanning number: %v", err)
		}
		if num <= 18 {
			numArr = append(numArr, num)
		} else {
			return nil, fmt.Errorf("number too large to be type")
		}

		if len(numArr) == 0 {
			return nil, fmt.Errorf("no number")
		}
	}
	return numArr, nil
}
