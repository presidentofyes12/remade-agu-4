// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library TripartiteComputations {
    struct TripartiteResult {
        int256 first;
        int256 second;
        int256 third;
        int256 result;
    }

    function computeTripartiteValue(int256 value) public pure returns (TripartiteResult memory) {
        // Initialize result struct
        TripartiteResult memory result;
        result.result = value;

        // Apply the tripartite relationships based on the number table
        if (value == 925925926) { // 0.925925926
            result.first = 16666666670;
            result.second = -8333333333;
            result.third = -7407407407;
        }
        else if (value == 1851851852) { // 1.851851852
            result.first = -6481481481;
            result.second = -5555555556;
            result.third = 13888888890;
        }
        else if (value == 2777777778) { // 2.777777778
            result.first = 14814814810;
            result.second = -6481481481;
            result.third = -5555555556;
        }
        else if (value == 3703703704) { // 3.703703704
            result.first = -4629629630;
            result.second = -3703703704;
            result.third = 12037037040;
        }
        else if (value == 4629629630) { // 4.62962963
            result.first = 12962962960;
            result.second = -4629629630;
            result.third = -3703703704;
        }
        else if (value == 5555555556) { // 5.555555556
            result.first = -2777777778;
            result.second = -1851851852;
            result.third = 10185185190;
        }
        else if (value == 6481481481) { // 6.481481481
            result.first = 11111111110;
            result.second = -2777777778;
            result.third = -1851851852;
        }
        else if (value == 7407407407) { // 7.407407407
            result.first = -925925926;
            result.second = 0;
            result.third = 8333333333;
        }
        else if (value == 8333333333) { // 8.333333333
            result.first = 9259259259;
            result.second = -925925926;
            result.third = 0;
        }
        else if (value == 9259259259) { // 9.259259259
            result.first = 925925926;
            result.second = 1851851852;
            result.third = 6481481481;
        }
        else if (value == 10185185190) { // 10.18518519
            result.first = 7407407407;
            result.second = 925925926;
            result.third = 1851851852;
        }
        else if (value == 11111111110) { // 11.11111111
            result.first = 2777777778;
            result.second = 3703703704;
            result.third = 4629629630;
        }
        else if (value == 12037037040) { // 12.03703704
            result.first = 5555555556;
            result.second = 2777777778;
            result.third = 3703703704;
        }
        else if (value == 12962962960) { // 12.96296296
            result.first = 4629629630;
            result.second = 5555555556;
            result.third = 2777777778;
        }
        else if (value == 13888888890) { // 13.88888889
            result.first = 3703703704;
            result.second = 4629629630;
            result.third = 5555555556;
        }
        else if (value == 14814814810) { // 14.81481481
            result.first = 6481481481;
            result.second = 7407407407;
            result.third = 925925926;
        }
        else if (value == 15740740740) { // 15.74074074
            result.first = 1851851852;
            result.second = 6481481481;
            result.third = 7407407407;
        }
        else if (value == 16666666670) { // 16.66666667
            result.first = 8333333333;
            result.second = 9259259259;
            result.third = -925925926;
        }
        else if (value == 17592592590) { // 17.59259259
            result.first = 0;
            result.second = 8333333333;
            result.third = 9259259259;
        }
        else if (value == 18518518520) { // 18.51851852
            result.first = 10185185190;
            result.second = 11111111110;
            result.third = -2777777778;
        }
        else if (value == 19444444440) { // 19.44444444
            result.first = -1851851852;
            result.second = 10185185190;
            result.third = 11111111110;
        }
        else if (value == 20370370370) { // 20.37037037
            result.first = 12037037040;
            result.second = 12962962960;
            result.third = -4629629630;
        }
        else if (value == 21296296300) { // 21.2962963
            result.first = -3703703704;
            result.second = 12037037040;
            result.third = 12962962960;
        }
        else if (value == 22222222220) { // 22.22222222
            result.first = 13888888890;
            result.second = 14814814810;
            result.third = -6481481481;
        }
        else if (value == 23148148150) { // 23.14814815
            result.first = -5555555556;
            result.second = 13888888890;
            result.third = 14814814810;
        }
        else if (value == 24074074070) { // 24.07407407
            result.first = 15740740740;
            result.second = 16666666670;
            result.third = -8333333333;
        }
        else if (value == 25000000000) { // 25
            result.first = -7407407407;
            result.second = 15740740740;
            result.third = 16666666670;
        }
        else if (value == 25925925930) { // 25.92592593
            result.first = 17592592590;
            result.second = 18518518520;
            result.third = -10185185190;
        }
        else if (value == 26851851850) { // 26.85185185
            result.first = -9259259259;
            result.second = 17592592590;
            result.third = 18518518520;
        }
        else if (value == 27777777780) { // 27.77777778
            result.first = 19444444440;
            result.second = 20370370370;
            result.third = -12037037040;
        }
        else if (value == 28703703700) { // 28.7037037
            result.first = -11111111110;
            result.second = 19444444440;
            result.third = 20370370370;
        }
        else if (value == 29629629630) { // 29.62962963
            result.first = 21296296300;
            result.second = 22222222220;
            result.third = -13888888890;
        }
        else if (value == 30555555560) { // 30.55555556
            result.first = -12962962960;
            result.second = 21296296300;
            result.third = 22222222220;
        }
        else if (value == 31481481480) { // 31.48148148
            result.first = 23148148150;
            result.second = 24074074070;
            result.third = -15740740740;
        }
        else if (value == 32407407410) { // 32.40740741
            result.first = -14814814810;
            result.second = 23148148150;
            result.third = 24074074070;
        }
        else if (value == 33333333330) { // 33.33333333
            result.first = 25000000000;
            result.second = 25925925930;
            result.third = -17592592590;
        }
        else if (value == 34259259260) { // 34.25925926
            result.first = -16666666670;
            result.second = 25000000000;
            result.third = 25925925930;
        }
        else if (value == 35185185190) { // 35.18518519
            result.first = 26851851850;
            result.second = 27777777780;
            result.third = -19444444440;
        }
        else if (value == 36111111110) { // 36.11111111
            result.first = -18518518520;
            result.second = 26851851850;
            result.third = 27777777780;
        }
        else if (value == 37037037040) { // 37.03703704
            result.first = 28703703700;
            result.second = 29629629630;
            result.third = -21296296300;
        }
        else if (value == 37962962960) { // 37.96296296
            result.first = -20370370370;
            result.second = 28703703700;
            result.third = 29629629630;
        }
        else if (value == 38888888890) { // 38.88888889
            result.first = 30555555560;
            result.second = 31481481480;
            result.third = -23148148150;
        }
        else if (value == 39814814810) { // 39.81481481
            result.first = -22222222220;
            result.second = 30555555560;
            result.third = 31481481480;
        }
        else if (value == 40740740740) { // 40.74074074
            result.first = 32407407410;
            result.second = 33333333330;
            result.third = -25000000000;
        }
        else if (value == 41666666670) { // 41.66666667
            result.first = -24074074070;
            result.second = 32407407410;
            result.third = 33333333330;
        }
        else if (value == 42592592590) { // 42.59259259
            result.first = 34259259260;
            result.second = 35185185190;
            result.third = -26851851850;
        }
        else if (value == 43518518520) { // 43.51851852
            result.first = -25925925930;
            result.second = 34259259260;
            result.third = 35185185190;
        }
        else if (value == 44444444440) { // 44.44444444
            result.first = 36111111110;
            result.second = 37037037040;
            result.third = -28703703700;
        }
        else if (value == 45370370370) { // 45.37037037
            result.first = -27777777780;
            result.second = 36111111110;
            result.third = 37037037040;
        }
        else if (value == 46296296300) { // 46.2962963
            result.first = 37962962960;
            result.second = 38888888890;
            result.third = -30555555560;
        }
        else if (value == 47222222220) { // 47.22222222
            result.first = -29629629630;
            result.second = 37962962960;
            result.third = 38888888890;
        }
        else if (value == 48148148150) { // 48.14814815
            result.first = 39814814810;
            result.second = 40740740740;
            result.third = -32407407410;
        }
        else if (value == 49074074070) { // 49.07407407
            result.first = -31481481480;
            result.second = 39814814810;
            result.third = 40740740740;
        }
        else if (value == 50000000000) { // 50
            result.first = 41666666670;
            result.second = 42592592590;
            result.third = -34259259260;
        }
        else if (value == 50925925930) { // 50.92592593
            result.first = -33333333330;
            result.second = 41666666670;
            result.third = 42592592590;
        }
        else if (value == 51851851850) { // 51.85185185
            result.first = 43518518520;
            result.second = 44444444440;
            result.third = -36111111110;
        }
        else if (value == 52777777780) { // 52.77777778
            result.first = -35185185190;
            result.second = 43518518520;
            result.third = 44444444440;
        }
        else if (value == 53703703700) { // 53.7037037
            result.first = 45370370370;
            result.second = 46296296300;
            result.third = -37962962960;
        }
        else if (value == 54629629630) { // 54.62962963
            result.first = -37037037040;
            result.second = 45370370370;
            result.third = 46296296300;
        }
        else if (value == 55555555560) { // 55.55555556
            result.first = 47222222220;
            result.second = 48148148150;
            result.third = -39814814810;
        }
        else if (value == 56481481480) { // 56.48148148
            result.first = -38888888890;
            result.second = 47222222220;
            result.third = 48148148150;
        }
        else if (value == 57407407410) { // 57.40740741
            result.first = 49074074070;
            result.second = 50000000000;
            result.third = -41666666670;
        }
        else if (value == 58333333330) { // 58.33333333
            result.first = -40740740740;
            result.second = 49074074070;
            result.third = 50000000000;
        }
        else if (value == 59259259260) { // 59.25925926
            result.first = 50925925930;
            result.second = 51851851850;
            result.third = -43518518520;
        }
        else if (value == 60185185190) { // 60.18518519
            result.first = -42592592590;
            result.second = 50925925930;
            result.third = 51851851850;
        }
        else if (value == 61111111110) { // 61.11111111
            result.first = 52777777780;
            result.second = 53703703700;
            result.third = -45370370370;
        }
        else if (value == 62037037040) { // 62.03703704
            result.first = -44444444440;
            result.second = 52777777780;
            result.third = 53703703700;
        }
        else if (value == 62962962960) { // 62.96296296
            result.first = 54629629630;
            result.second = 55555555560;
            result.third = -47222222220;
        }
        else if (value == 63888888890) { // 63.88888889
            result.first = -46296296300;
            result.second = 54629629630;
            result.third = 55555555560;
        }
        else if (value == 64814814810) { // 64.81481481
            result.first = 56481481480;
            result.second = 57407407410;
            result.third = -49074074070;
        }
        else if (value == 65740740740) { // 65.74074074
            result.first = -48148148150;
            result.second = 56481481480;
            result.third = 57407407410;
        }
        else if (value == 66666666670) { // 66.66666667
            result.first = 58333333330;
            result.second = 59259259260;
            result.third = -50925925930;
        }
        else if (value == 67592592590) { // 67.59259259
            result.first = -50000000000;
            result.second = 58333333330;
            result.third = 59259259260;
        }
        else if (value == 68518518520) { // 68.51851852
            result.first = 60185185190;
            result.second = 61111111110;
            result.third = -52777777780;
        }
        else if (value == 69444444440) { // 69.44444444
            result.first = -51851851850;
            result.second = 60185185190;
            result.third = 61111111110;
        }
        else if (value == 70370370370) { // 70.37037037
            result.first = 62037037040;
            result.second = 62962962960;
            result.third = -54629629630;
        }
        else if (value == 71296296300) { // 71.2962963
            result.first = -53703703700;
            result.second = 62037037040;
            result.third = 62962962960;
        }
        else if (value == 72222222220) { // 72.22222222
            result.first = 63888888890;
            result.second = 64814814810;
            result.third = -56481481480;
        }
        else if (value == 73148148150) { // 73.14814815
            result.first = -55555555560;
            result.second = 63888888890;
            result.third = 64814814810;
        }
        else if (value == 74074074070) { // 74.07407407
            result.first = 65740740740;
            result.second = 66666666670;
            result.third = -58333333330;
        }
        else if (value == 75000000000) { // 75
            result.first = -57407407410;
            result.second = 65740740740;
            result.third = 66666666670;
        }
        else if (value == 75925925930) { // 75.92592593
            result.first = 67592592590;
            result.second = 68518518520;
            result.third = -60185185190;
        }
        else if (value == 76851851850) { // 76.85185185
            result.first = -59259259260;
            result.second = 67592592590;
            result.third = 68518518520;
        }
        else if (value == 77777777780) { // 77.77777778
            result.first = 69444444440;
            result.second = 70370370370;
            result.third = -62037037040;
        }
        else if (value == 78703703700) { // 78.7037037
            result.first = -61111111110;
            result.second = 69444444440;
            result.third = 70370370370;
        }
        else if (value == 79629629630) { // 79.62962963
            result.first = 71296296300;
            result.second = 72222222220;
            result.third = -63888888890;
        }
        else if (value == 80555555560) { // 80.55555556
            result.first = -62962962960;
            result.second = 71296296300;
            result.third = 72222222220;
        }
        else if (value == 81481481480) { // 81.48148148
            result.first = 73148148150;
            result.second = 74074074070;
            result.third = -65740740740;
        }
        else if (value == 82407407410) { // 82.40740741
            result.first = -64814814810;
            result.second = 73148148150;
            result.third = 74074074070;
        }
        else if (value == 83333333330) { // 83.33333333
            result.first = 75000000000;
            result.second = 75925925930;
            result.third = -67592592590;
        }
        else if (value == 84259259260) { // 84.25925926
            result.first = -66666666670;
            result.second = 75000000000;
            result.third = 75925925930;
        }
        else if (value == 85185185190) { // 85.18518519
            result.first = 76851851850;
            result.second = 77777777780;
            result.third = -69444444440;
        }
        else if (value == 86111111110) { // 86.11111111
            result.first = -68518518520;
            result.second = 76851851850;
            result.third = 77777777780;
        }
        else if (value == 87037037040) { // 87.03703704
            result.first = 78703703700;
            result.second = 79629629630;
            result.third = -71296296300;
        }
        else if (value == 87962962960) { // 87.96296296
            result.first = -70370370370;
            result.second = 78703703700;
            result.third = 79629629630;
        }
        else if (value == 88888888890) { // 88.88888889
            result.first = 80555555560;
            result.second = 81481481480;
            result.third = -73148148150;
        }
        else if (value == 89814814810) { // 89.81481481
            result.first = -72222222220;
            result.second = 80555555560;
            result.third = 81481481480;
        }
        else if (value == 90740740740) { // 90.74074074
            result.first = 82407407410;
            result.second = 83333333330;
            result.third = -75000000000;
        }
        else if (value == 91666666670) { // 91.66666667
            result.first = -74074074070;
            result.second = 82407407410;
            result.third = 83333333330;
        }
        else if (value == 92592592590) { // 92.59259259
            result.first = 84259259260;
            result.second = 85185185190;
            result.third = -76851851850;
        }
        else if (value == 93518518520) { // 93.51851852
            result.first = -75925925930;
            result.second = 84259259260;
            result.third = 85185185190;
        }
        else if (value == 94444444440) { // 94.44444444
            result.first = 86111111110;
            result.second = 87037037040;
            result.third = -78703703700;
        }
        else if (value == 95370370370) { // 95.37037037
            result.first = -77777777780;
            result.second = 86111111110;
            result.third = 87037037040;
        }
        else if (value == 96296296300) { // 96.2962963
            result.first = 87962962960;
            result.second = 88888888890;
            result.third = -80555555560;
        }
        else if (value == 97222222220) { // 97.22222222
            result.first = -79629629630;
            result.second = 87962962960;
            result.third = 88888888890;
        }
        else if (value == 98148148150) { // 98.14814815
            result.first = 89814814810;
            result.second = 90740740740;
            result.third = -82407407410;
        }
        else if (value == 99074074070) { // 99.07407407
            result.first = -81481481480;
            result.second = 89814814810;
            result.third = 90740740740;
        }
        else if (value == 100000000000) { // 100
            result.first = 91666666670;
            result.second = 92592592590;
            result.third = -84259259260;
        }
        
        return result;
    }

    function validateTripartiteSum(int256 first, int256 second, int256 third, int256 expected) public pure returns (bool) {
        return (first + second + third == expected);
    }

    function getTripartiteComponents(int256 value) public pure returns (int256, int256, int256) {
        TripartiteResult memory result = computeTripartiteValue(value);
        return (result.first, result.second, result.third);
    }
}