import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import sys
from random import randrange,uniform
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.metrics import confusion_matrix
from sklearn import model_selection
from sklearn.metrics import classification_report,roc_auc_score,roc_curve
from sklearn.metrics import classification_report
from sklearn.naive_bayes import GaussianNB
np.random.seed(123)
pd.options.mode.chained_assignment = None
data = pd.read_csv("C:/Users/Srikar/Desktop/finalproj/data.csv")
data.columns = ['age', 'sex', 'chest_pain_type', 'resting_blood_pressure', 'cholesterol', 'fasting_blood_sugar', 'rest_ecg', 'max_heart_rate_achieved',
       'exercise_induced_angina', 'st_depression', 'st_slope', 'num_major_vessels', 'thalassemia', 'target']
predictors = data.drop("target",axis=1)
target = data["target"]
X_train,X_test,Y_train,Y_test = train_test_split(predictors,target,test_size=0.20,random_state=0)
nb = GaussianNB()
Y_train=Y_train.astype('int')
nb.fit(X_train,Y_train)
Y_pred_nb = nb.predict(X_test)
Y_pred_nb.shape
Y_pred_nb
CM=pd.crosstab(Y_test,Y_pred_nb)
CM
TN=CM.iloc[0,0]
FP=CM.iloc[0,1]
FN=CM.iloc[1,0]
TP=CM.iloc[1,1]
score_nb=float(((TP+TN)*100)/(TP+TN+FP+FN))
arg1=sys.argv[1]
arg2=sys.argv[2]
arg3=sys.argv[3]
arg4=sys.argv[4]
arg5=sys.argv[5]
arg6=sys.argv[6]
arg7=sys.argv[7]
arg8=sys.argv[8]
arg9=sys.argv[9]
arg10=sys.argv[10]
arg11=sys.argv[11]
arg12=sys.argv[12]
arg13=sys.argv[13]
test = {'age':[arg1], 'sex':[arg2], 'chest_pain_type':[arg3], 'resting_blood_pressure':[arg4], 'cholesterol':[arg5], 'fasting_blood_sugar':[arg6], 'rest_ecg':[arg7], 'max_heart_rate_achieved':[arg8],'exercise_induced_angina':[arg9], 'st_depression':[arg10], 'st_slope':[arg11], 'num_major_vessels':[arg12], 'thalassemia':[arg13]}
testdata=pd.DataFrame(test)
predicton=nb.predict(testdata)
print(predicton)

