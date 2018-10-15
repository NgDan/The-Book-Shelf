import React, {Component} from 'react';
import {auth} from '../actions';
import {connect} from 'react-redux';
import axios from 'axios'; 

export default function(ComposedClass,reload){
    class AuthenticationCheck extends Component{

        state = {
            loading:true
        }

        componentWillMount(){
            this.props.dispatch(auth())
        }

        //checks if user is authenticated and lets redirects to the component or redirects to login
        componentWillReceiveProps(nextProps){
            this.setState({loading:false});
            if(!nextProps.user.login.isAuth){
                if(reload){
                    this.props.history.push('/login');
                }
                
            }
            else{
                //if you skip if reload === false it will enter an infinite loop because the function checks if user is authenticated
                //and redirects you to /user again which will check if authenticated and redirect you again to /user again and again
                if(reload === false){
                    this.props.history.push('/user');
                }
            }
        }

        render(){
            if(this.state.loading){
                return <div className="loader">Loading...</div>
            }
            return(
                <ComposedClass {...this.props} user={this.props.user}/>
            )
        }
    }

function mapStateToProps(state){
return {
    user:state.user
}
}
return connect(mapStateToProps)(AuthenticationCheck)
}

