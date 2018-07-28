import React, {Component} from 'react';
import TextField from './common/TextField';
import RadioField from './common/RadioField';
import MultiSelectField from './common/MultiSelectField';
import MultiCheckboxField from './common/MultiCheckboxField';
import {initialFormState} from './initialFormState.js'
import './App.css';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import {getFitbitPermissions, submitForm} from "./networking/networkingHelper";

const theme = createMuiTheme({
    palette: {
        primary: { main: "#ff6f00" },
        secondary: { main: "#1565c0" },
    },
});


class App extends Component {
    state = {
        form: initialFormState,
        formKeys: Object.keys(initialFormState),
        selectedInput: null,
        currentPage: 2
    };
    componentDidUpdate() {
        localStorage.setItem("storedState", JSON.stringify(this.state))
    };
    componentDidMount(){
        try{
            const storedState = localStorage.getItem("storedState");
            if (!storedState) return;
            const parsedState = JSON.parse(storedState);
            this.setState({
                form: parsedState.form
            });
        }
        catch (e) {
            console.log("Error loading saved state");
        }
    }
    setFormField = (fieldName, valueSet) => this.setState(state => {
        const newState = {
            ...state,
            form: {
                ...state.form,
                [fieldName]: {
                    ...state.form[fieldName],
                    ...valueSet
                }
            }
        };
        console.log(newState);
        return newState;
    });
    setSelecetdInput = (formKey) => {
        setTimeout(() => this.setState(state => ({
            ...state,
            selectedInput: formKey
        })), 0)
    };
    unSelect = (e) => {
        e.stopPropagation();
        this.setState(state => ({
            ...state,
            selectedInput: null
        }))
    };
    buildComponent = (formKey, formItem) => {
        const props = Object.assign(
            {
                key: formKey,
                fieldName: formKey,
                setFormField: this.setFormField,
                setSelectedInput: this.setSelecetdInput,
                currentlyFocused : this.state.selectedInput === formKey
            },
            formItem,
        );
        switch (formItem.type){
            case "radio":
                return <RadioField {...props} />;
            case "checkbox":
                return <MultiSelectField {...props} />;
            case "multicheckbox":
                return <MultiCheckboxField {...props} />;
            default:
                return <TextField {...props} type={formItem.type} />;
        }
    };

    submitForm = async () => {
        const submissionResult = await submitForm(this.state);
        if (submissionResult) this.nextPage();
    };
    nextPage = () => this.setState(state => ({
        ...state,
        currentPage: state.currentPage+1
    }));
    startFitbitAuthFlow = () => {
        getFitbitPermissions(this.state.form.email);
    }
    render() {
        if (this.state.currentPage !== 1) {
            return (
                <MuiThemeProvider theme={theme}>
                    <div style={{minHeight: '56vh'}}>
                        <br/><br/>
                        <h2>Link your FitBit Account</h2>
                        <br/>
                        <p>Please click the button below to be redirected to the Fitbit website in order to allow access to your activity data.</p>
                        <br/>
                        <Button
                            onClick={this.startFitbitAuthFlow}
                            variant="contained"
                            style={{color:'white', fontWeight:"bold", padding: "0.5rem 2rem", fontSize: "1rem"}}
                            color={"primary"} >
                            Fitbit Authorization
                        </Button>

                    </div>
                </MuiThemeProvider>
            )
        }
        return (
            <MuiThemeProvider theme={theme}>
                <div className="App" onClick={this.unSelect}>
                    {
                        this.state.formKeys.map((formKey, idx) => {
                            // if (idx > 3) return;
                            const formItem = this.state.form[formKey];

                            return this.buildComponent(formKey, formItem);
                        })
                    }
                </div>
                <Button
                    onClick={this.submitForm}
                    variant="contained"
                    style={{color:'white', fontWeight:"bold", padding: "0.5rem 2rem", fontSize: "1rem"}}
                    color={"primary"} >
                    Submit
                </Button>
            </MuiThemeProvider>
        );
    }
}

export default App;
